import Account from "../components/Account";
import Auth from "../components/Auth";
import "../global.css";

export const Popup = () => {
  const session = true;
  return (
    <div className="text-5xl p-10 font-extrabold">
      {session ? <Auth /> : <Account session={session} />}
    </div>
  );
};
