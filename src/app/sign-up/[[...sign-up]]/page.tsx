import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
    return (
        <div className="min-h-screen flex bg-white">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex w-1/2 bg-feather-green items-center justify-center p-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="relative z-10 max-w-md text-center text-white space-y-6">
                    <div className="text-6xl mb-4">🚀</div>
                    <h1 className="text-5xl font-extrabold tracking-tight">
                        Get Started!
                    </h1>
                    <p className="text-xl font-bold opacity-90">
                        Join thousands of freelancers sending smarter quotes today.
                    </p>
                    <div className="grid grid-cols-2 gap-4 mt-12 text-left">
                        <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border-2 border-white/20">
                            <div className="text-2xl mb-2">💼</div>
                            <div className="font-extrabold">Pro Tools</div>
                        </div>
                        <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border-2 border-white/20">
                            <div className="text-2xl mb-2">📈</div>
                            <div className="font-extrabold">Track Views</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-swan-white">
                <div className="w-full max-w-md">
                    <SignUp
                        appearance={{
                            elements: {
                                formButtonPrimary:
                                    "bg-feather-green hover:bg-feather-green-active text-white font-extrabold py-3 px-6 rounded-xl shadow-btn shadow-feather-green-active border-b-4 border-feather-green-active active:border-b-0 active:translate-y-1 transition-all",
                                card: "shadow-none bg-transparent",
                                headerTitle: "text-2xl font-extrabold text-eel-black",
                                headerSubtitle: "text-wolf-grey font-bold",
                                socialButtonsBlockButton:
                                    "border-2 border-hare-grey hover:bg-hare-grey/20 text-eel-black font-bold rounded-xl",
                                formFieldInput:
                                    "border-2 border-hare-grey focus:border-feather-green rounded-xl py-2 px-4 font-bold text-eel-black outline-none transition-colors",
                                formFieldLabel: "text-wolf-grey font-bold uppercase text-xs mb-1",
                                footerActionLink: "text-feather-green font-bold hover:text-feather-green-active",
                            },
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
