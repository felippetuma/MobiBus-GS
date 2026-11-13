const page = () => {
    return (
        <div className="w-full min-h-dvh flex items-center justify-center px-4 sm:px-6 pt-24 pb-10">
            <div className="space-y-6 sm:space-y-8 p-5 sm:p-8 w-full max-w-sm sm:max-w-md rounded-2xl bg-zinc-200 shadow-lg">

                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-center sm:text-left">
                        Entrar na conta
                    </h2>
                <form action="" className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm sm:text-base font-medium block">Seu e-mail: <span className="text-red-600">*</span></label>
                        <input type="email" autoComplete="email" placeholder='email@email.com' className="w-full px-4 py-2.5 text-sm sm:text-base placeholder-black/40 border border-white/10 text-center bg-zinc-300 rounded-xl focus:outline-none focus:border-blue-mobi focus:ring-1 focus:ring-blue-mobi transition-all" required />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm sm:text-base font-medium block">Senha: <span className="text-red-600">*</span></label>
                        <input type="password" autoComplete="current-password" placeholder='************' className="w-full px-4 py-2.5 text-sm sm:text-base placeholder-black/40 border border-white/10 text-center bg-zinc-300 rounded-xl focus:outline-none focus:border-blue-mobi focus:ring-1 focus:ring-blue-mobi transition-all" required />
                    </div>

                    <button type="submit" className="w-full bg-blue-mobi text-white cursor-pointer hover:font-medium px-4 py-2.5 text-sm sm:text-base rounded-xl">Entrar</button>
                </form>
            </div>
        </div>
    )
}

export default page
