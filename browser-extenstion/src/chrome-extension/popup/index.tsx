import "../global.css";
import { useSession } from "../hooks/useSession";

export const Popup = () => {
  const { session } = useSession();
  return (
    <div className="text-5xl p-10 font-extrabold">
      <p>Equational Agent</p>
      {session ? (<p>Logged in</p>) : (<p>Not logged in</p>)}
    </div>
  );
};