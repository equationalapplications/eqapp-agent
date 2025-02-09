import { useEffect, useState } from "react";
import "../global.css";
import { supabase } from "../lib/supabaseClient";
import { Session } from "@supabase/supabase-js";

export const Popup = () => {
  const [session, setSession] = useState<Session | null>(null);
  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      console.log("Auth state changed:", event, session);
    })
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
  }, []);

  useEffect(() => {
    if (!session) {
      chrome.tabs.create({ url: process.env.VITE_WEB_AUTH_URL });
    }
  }, [session]);

  return (
    <div className="text-5xl p-10 font-extrabold">
      {session ? <p>Equational Agent</p> : <p>Please sign in</p>}
    </div>
  );
};
