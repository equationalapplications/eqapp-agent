import { useEffect } from "react";
import "../global.css";
import { supabase } from "../lib/supabaseClient";

export const Popup = () => {

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        const authUrl = import.meta.env.VITE_WEB_AUTH_URL;
        chrome.tabs.create({ url: authUrl }); // No need to store tabId here
      }
    });
  }, []);


  return (
    <div className="text-5xl p-10 font-extrabold">
      <p>Equational Agent</p>
    </div>
  );
};