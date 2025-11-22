import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
    return (
        <div className="min-h-screen flex bg-white">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex w-1/2 bg-macaw-blue items-center justify-center p-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="relative z-10 max-w-md text-center text-white space-y-6">
                    <div className="text-6xl mb-4">🐦</div>
                    <h1 className="text-5xl font-extrabold tracking-tight">
                        Welcome back!
                    </h1>
                    <p className="text-xl font-bold opacity-90">
                        Ready to close more deals? Your dashboard is waiting.
                    </p>
                    <div className="grid grid-cols-2 gap-4 mt-12 text-left">
                        <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border-2 border-white/20">
                            <div className="text-2xl mb-2">⚡️</div>
                            <div className="font-extrabold">Fast Quotes</div>
                        </div>
                        <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border-2 border-white/20">
                            <div className="text-2xl mb-2">🧠</div>
                            <div className="font-extrabold">AI Powered</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-swan-white">
                <div className="w-full max-w-md">
                    <SignIn
                        appearance={{
                            elements: {
                                formButtonPrimary:
                                    "bg-macaw-blue hover:bg-macaw-blue-active text-white font-extrabold py-3 px-6 rounded-xl shadow-btn shadow-macaw-blue-active border-b-4 border-macaw-blue-active active:border-b-0 active:translate-y-1 transition-all",
                                card: "shadow-none bg-transparent",
                                headerTitle: "text-2xl font-extrabold text-eel-black",
                                headerSubtitle: "text-wolf-grey font-bold",
                                socialButtonsBlockButton:
                                    "border-2 border-hare-grey hover:bg-hare-grey/20 text-eel-black font-bold rounded-xl",
                                formFieldInput:
                                    "border-2 border-hare-grey focus:border-macaw-blue rounded-xl py-2 px-4 font-bold text-eel-black outline-none transition-colors",
                                formFieldLabel: "text-wolf-grey font-bold uppercase text-xs mb-1",
                                footerActionLink: "text-macaw-blue font-bold hover:text-macaw-blue-active",
                            },
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
