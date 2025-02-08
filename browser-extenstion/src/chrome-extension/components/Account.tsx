import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Session } from '@supabase/supabase-js';
import ChangePasword from './ChangePassword';


export default function Account({ session }: { session: Session }) {
    const [action, setAction] = useState<'default' | 'change-password'>('default');

    function toggleChangePassword() {
        if (action === 'default') {
            setAction('change-password');
        }
        if (action === 'change-password') {
            setAction('default');
        }
    }

    return (
        <div className="row flex flex-center">
            <div className="col-6 form-widget">
                <h1 className="header">Equational Applications LLC</h1>
                <h2>Signed In</h2>
                <button className="button block" type="button" onClick={() => supabase.auth.signOut()}>
                    Sign Out
                </button>
                < br />
                <button className="button block" type="button" onClick={toggleChangePassword}>
                    {action === 'default' ? <span>Change Password</span> : <span>Cancel</span>}
                </button>
                {action === 'change-password' && <ChangePasword session={session} onComplete={() => setAction('default')} />}
            </div>
        </div>
    );
}