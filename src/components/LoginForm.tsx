"use client"

import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";

const email = "admin@mobibus.com.br";
const password = "MobibusAdmin123";

const subscribe = () => () => {};

const getLogged = (): boolean | null => {
    try {
        return localStorage.getItem("logged") !== null;
    } catch {
        return false;
    }
};

const LoginForm = () => {
    const router = useRouter();
    const [error, setError] = useState(false);

    const logged = useSyncExternalStore(subscribe, getLogged, () => null);

    useEffect(() => {
        if (logged === true) router.replace("/dashboard");
    }, [logged, router]);

    const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();

        const data = new FormData(e.currentTarget);
        const emailInserted = String(data.get("email") ?? "").trim();
        const senhaInserted = String(data.get("password") ?? "");

        if (emailInserted === email && senhaInserted === password) {
            setError(false);
            localStorage.setItem("logged", "true");
            router.push("/dashboard");
        } else {
            setError(true);
        }
    }

    if (logged === true) return null;

    return (
        <div className="space-y-6 sm:space-y-8 p-5 sm:p-8 w-full max-w-sm sm:max-w-md rounded-2xl bg-zinc-200 shadow-lg">

            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-center sm:text-left">
                Entrar na conta
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="bg-alert/20 rounded-2xl flex items-center justify-center p-4 gap-2 text-alert shadow-sm shadow-alert">
                        <AlertCircle size={18}/>
                        <p role="alert" className="text-sm text-center font-bold text-alert">E-mail ou senha incorretos.</p>
                    </div>
                )}
                <div className="space-y-2">
                    <label className="text-sm sm:text-base font-medium block">Seu e-mail: <span className="text-red-600">*</span></label>
                    <input type="email" name="email" onChange={() => setError(false)} autoComplete="email" placeholder='email@email.com' className="w-full px-4 py-2.5 text-sm sm:text-base placeholder-black/40 border border-white/10 text-center bg-zinc-300 rounded-xl focus:outline-none focus:border-blue-mobi focus:ring-1 focus:ring-blue-mobi transition-all" required />
                </div>
                <div className="space-y-2">
                    <label className="text-sm sm:text-base font-medium block">Senha: <span className="text-red-600">*</span></label>
                    <input type="password" name="password" onChange={() => setError(false)} autoComplete="current-password" placeholder='************' className="w-full px-4 py-2.5 text-sm sm:text-base placeholder-black/40 border border-white/10 text-center bg-zinc-300 rounded-xl focus:outline-none focus:border-blue-mobi focus:ring-1 focus:ring-blue-mobi transition-all" required />
                </div>


                <button type="submit" className="w-full bg-blue-mobi text-white cursor-pointer hover:font-medium px-4 py-2.5 text-sm sm:text-base rounded-xl">Entrar</button>
            </form>
        </div>
    )
}

export default LoginForm
