-- Trigger to track user logins from auth.users

CREATE OR REPLACE FUNCTION log_auth_sign_in()
RETURNS TRIGGER AS $$
DECLARE
    current_user_name text;
    current_user_role text;
BEGIN
    -- Only log if the last_sign_in_at timestamp has changed (which means a new login occurred)
    IF (OLD.last_sign_in_at IS NULL AND NEW.last_sign_in_at IS NOT NULL) OR (OLD.last_sign_in_at IS DISTINCT FROM NEW.last_sign_in_at) THEN
        
        -- Fetch user details from our public users table
        SELECT first_name || ' ' || last_name, role::text INTO current_user_name, current_user_role 
        FROM public.users 
        WHERE id = NEW.id;

        INSERT INTO public.audit_logs (
            user_id,
            user_name,
            user_role,
            action,
            type,
            affected_record,
            metadata
        ) VALUES (
            NEW.id,
            COALESCE(current_user_name, 'Unknown User'),
            COALESCE(current_user_role, 'unknown'),
            'User logged in',
            'auth',
            NEW.id::text,
            jsonb_build_object('provider', NEW.raw_app_meta_data->>'provider')
        );
    END IF;
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Login audit log failed: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS audit_auth_sign_in ON auth.users;
CREATE TRIGGER audit_auth_sign_in
AFTER UPDATE ON auth.users
FOR EACH ROW EXECUTE FUNCTION log_auth_sign_in();
