const page = () => {
    return (
        <div className="w-full min-h-screen flex items-center justify-center">
            <div className="space-y-8 p-8 md:p-8 w-full max-w-md rounded-2xl bg-zinc-200">

                    <h2 className="text-2xl font-bold tracking-tight space-y-2">
                        Entrar na conta
                    </h2>
                <form action="" className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-md font-medium block">Seu e-mail: <span className="text-red-600">*</span></label>
                        <input type="text" placeholder='email@email.com' className="w-full px-4 py-2 placeholder-black/40 border border-white/10 text-center bg-zinc-300 rounded-xl focus:outline-none focus:border-blue-mobi focus:ring-1 focus:ring-blue-mobi transition-all" required />
                    </div>
                    <div className="space-y-2">
                        <label className="text-md font-medium block">Senha: <span className="text-red-600">*</span></label>
                        <input type="text" placeholder='************' className="w-full px-4 py-2 placeholder-black/40 border border-white/10 text-center bg-zinc-300 rounded-xl focus:outline-none focus:border-blue-mobi focus:ring-1 focus:ring-blue-mobi transition-all" required />
                    </div>

                    <button type="submit" className="w-full bg-blue-mobi cursor-pointer hover:font-medium px-4 py-2 rounded-xl">Entrar</button>
                </form>
            </div>
        </div>
    )
}

export default page
