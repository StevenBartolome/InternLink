-- Migration: 19_enable_audit_triggers.sql
-- Description: Create a generic trigger function for audit logging and attach it to major tables

-- 1. Create the generic trigger function
CREATE OR REPLACE FUNCTION process_audit_log()
RETURNS TRIGGER AS $$
DECLARE
    current_user_id uuid;
    current_user_name text;
    current_user_role text;
    action_text text;
    record_id text;
    meta_jsonb jsonb;
BEGIN
    -- Get the authenticated user ID from Supabase's JWT context
    current_user_id := auth.uid();
    
    -- If there's an authenticated user, fetch their name and role
    IF current_user_id IS NOT NULL THEN
        SELECT first_name || ' ' || last_name, role::text INTO current_user_name, current_user_role 
        FROM public.users 
        WHERE id = current_user_id;
    ELSE
        -- If no authenticated user (e.g. backend service role or unauthenticated hook), set defaults
        current_user_name := 'System / Admin';
        current_user_role := 'system';
    END IF;

    -- Determine action and affected record ID by parsing JSON representation
    IF (TG_OP = 'DELETE') THEN
        action_text := 'Deleted record in ' || TG_TABLE_NAME;
        record_id := (row_to_json(OLD)->>'id')::text;
        meta_jsonb := jsonb_build_object('old_data', row_to_json(OLD));
    ELSIF (TG_OP = 'UPDATE') THEN
        action_text := 'Updated record in ' || TG_TABLE_NAME;
        record_id := (row_to_json(NEW)->>'id')::text;
        meta_jsonb := jsonb_build_object('new_data', row_to_json(NEW), 'old_data', row_to_json(OLD));
    ELSIF (TG_OP = 'INSERT') THEN
        action_text := 'Created record in ' || TG_TABLE_NAME;
        record_id := (row_to_json(NEW)->>'id')::text;
        meta_jsonb := jsonb_build_object('new_data', row_to_json(NEW));
    END IF;

    -- Insert the audit log
    INSERT INTO public.audit_logs (
        user_id,
        user_name,
        user_role,
        action,
        type,
        affected_record,
        metadata
    ) VALUES (
        current_user_id,
        current_user_name,
        current_user_role,
        action_text,
        TG_TABLE_NAME, -- Use table name as the 'type'
        record_id,
        meta_jsonb
    );

    IF (TG_OP = 'DELETE') THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        -- If logging fails, we shouldn't block the actual data operation
        RAISE WARNING 'Audit log failed: %', SQLERRM;
        IF (TG_OP = 'DELETE') THEN RETURN OLD; ELSE RETURN NEW; END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Helper function to safely apply triggers (drops if exists, then creates)
CREATE OR REPLACE FUNCTION apply_audit_trigger(table_name text) RETURNS void AS $$
BEGIN
    EXECUTE format('DROP TRIGGER IF EXISTS audit_trigger_%I ON public.%I', table_name, table_name);
    EXECUTE format('CREATE TRIGGER audit_trigger_%I AFTER INSERT OR UPDATE OR DELETE ON public.%I FOR EACH ROW EXECUTE FUNCTION process_audit_log()', table_name, table_name);
END;
$$ LANGUAGE plpgsql;

-- 3. Apply the trigger to all major tables
SELECT apply_audit_trigger('users');
SELECT apply_audit_trigger('student_profiles');
SELECT apply_audit_trigger('student_internships');
SELECT apply_audit_trigger('departments');
SELECT apply_audit_trigger('programs');
SELECT apply_audit_trigger('program_sections');
SELECT apply_audit_trigger('companies');
SELECT apply_audit_trigger('attendance_logs');
SELECT apply_audit_trigger('daily_activities');
SELECT apply_audit_trigger('weekly_activity_reports');
SELECT apply_audit_trigger('student_moas');
SELECT apply_audit_trigger('portfolio_documents');

-- 4. Clean up helper function
DROP FUNCTION apply_audit_trigger(text);
