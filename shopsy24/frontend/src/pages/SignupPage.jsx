import React from 'react'

const SignupPage = () => {
    return (
        <div className="bg-background-light dark:bg-background-dark font-display">
            <div className="relative flex h-auto min-h-screen w-full flex-col group/design-root overflow-x-hidden">
                {/* Header Image */}
                <div className="@container">
                    <div className="@[480px]:px-4 @[480px]:py-3">
                        <div
                            className='w-full bg-center bg-no-repeat bg-cover flex flex-col justify-end overflow-hidden @[480px]:rounded-xl min-h-[218px]'
                            data-alt="A delicious and aromatic plate of biryani with saffron rice, meat, and herbs."
                            style={{
                                backgroundImage:
                                    'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCdVwb96VO2-uf3dCBwwLb9Xaf9NNJtNOWij8FxMEQot3NanWi2NPZkiZzx0N7MzJ4wVie2o00ML4g87S2pl9LmtkiRehOPC9hTzNxHFliCnJrVFvftiFk1guSEJXZDRGPcFhKO7ZNSQzDMnuVGE3bWE8N4uUnbGrr5ZymnII1lLEckHFoOINXj-vrAUUwDSXtYv3ZVDpcKnDOh9egPRADQb1Al7_UfQcdF29ZgSxgw-qhoohXc_AwNKFggAKF50LWti30OuLmE5PcC")',
                            }}
                        ></div>
                    </div>
                </div>

                <div className="flex flex-col px-4">
                    {/* Headline Text */}
                    <h1 className="text-text-light dark:text-text-dark tracking-tight text-[32px] font-bold leading-tight text-center pb-2 pt-6">
                        Create Your Account
                    </h1>

                    {/* Body Text */}
                    <p className="text-text-light/80 dark:text-text-dark/80 text-base font-normal leading-normal pb-6 text-center">
                        Sign up to start your delicious journey.
                    </p>

                    {/* Input Fields Form */}
                    <div className="flex flex-col gap-4">
                        {/* Full Name */}
                        <label className="flex flex-col w-full">
                            <p className="text-text-light dark:text-text-dark text-base font-medium leading-normal pb-2">
                                Full Name
                            </p>
                            <div className="flex w-full flex-1 items-stretch rounded-lg border border-secondary-light dark:border-secondary-dark bg-background-light dark:bg-background-dark">
                                <input
                                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-l-lg text-text-light dark:text-text-dark focus:outline-0 focus:ring-0 border-0 bg-transparent h-14 placeholder:text-text-light/50 dark:placeholder:text-text-dark/50 p-[15px] text-base font-normal leading-normal"
                                    placeholder="Your Full Name"
                                // onChange={e.target.value(value)}
                                />
                                <div className="text-text-light/60 dark:text-text-dark/60 flex items-center justify-center pr-[15px]">
                                    <span className="material-symbols-outlined">person</span>
                                </div>
                            </div>
                        </label>

                        {/* Email Address */}
                        <label className="flex flex-col w-full">
                            <p className="text-text-light dark:text-text-dark text-base font-medium leading-normal pb-2">
                                Email Address
                            </p>
                            <div className="flex w-full flex-1 items-stretch rounded-lg border border-secondary-light dark:border-secondary-dark bg-background-light dark:bg-background-dark">
                                <input
                                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-l-lg text-text-light dark:text-text-dark focus:outline-0 focus:ring-0 border-0 bg-transparent h-14 placeholder:text-text-light/50 dark:placeholder:text-text-dark/50 p-[15px] text-base font-normal leading-normal"
                                    placeholder="your@email.com"
                                    type="email"
                                />
                                <div className="text-text-light/60 dark:text-text-dark/60 flex items-center justify-center pr-[15px]">
                                    <span className="material-symbols-outlined">mail</span>
                                </div>
                            </div>
                        </label>

                        {/* Password */}
                        <label className="flex flex-col w-full">
                            <p className="text-text-light dark:text-text-dark text-base font-medium leading-normal pb-2">
                                Password
                            </p>
                            <div className="flex w-full flex-1 items-stretch rounded-lg border border-secondary-light dark:border-secondary-dark bg-background-light dark:bg-background-dark">
                                <input
                                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-l-lg text-text-light dark:text-text-dark focus:outline-0 focus:ring-0 border-0 bg-transparent h-14 placeholder:text-text-light/50 dark:placeholder:text-text-dark/50 p-[15px] text-base font-normal leading-normal"
                                    placeholder="Create Password"
                                    type="password"
                                />
                                <button className="text-text-light/60 dark:text-text-dark/60 flex items-center justify-center pr-[15px] cursor-pointer">
                                    <span className="material-symbols-outlined">
                                        visibility_off
                                    </span>
                                </button>
                            </div>
                        </label>

                        {/* Confirm Password */}
                        <label className="flex flex-col w-full">
                            <p className="text-text-light dark:text-text-dark text-base font-medium leading-normal pb-2">
                                Confirm Password
                            </p>
                            <div className="flex w-full flex-1 items-stretch rounded-lg border border-red-500 bg-background-light dark:bg-background-dark">
                                <input
                                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-l-lg text-text-light dark:text-text-dark focus:outline-0 focus:ring-0 border-0 bg-transparent h-14 placeholder:text-text-light/50 dark:placeholder:text-text-dark/50 p-[15px] text-base font-normal leading-normal"
                                    placeholder="Confirm Password"
                                    type="password"
                                />
                                <button className="text-text-light/60 dark:text-text-dark/60 flex items-center justify-center pr-[15px] cursor-pointer">
                                    <span className="material-symbols-outlined">
                                        visibility_off
                                    </span>
                                </button>
                            </div>
                            {/* Validation Message */}
                            <p className="text-red-500 text-sm mt-1">
                                Passwords do not match.
                            </p>
                        </label>
                    </div>

                    {/* Privacy Policy Text */}
                    <p className="text-text-light/70 dark:text-text-dark/70 text-xs text-center py-6">
                        By signing up, you agree to our{" "}
                        <a className="font-semibold underline" href="#">
                            Terms
                        </a>{" "}
                        and{" "}
                        <a className="font-semibold underline" href="#">
                            Privacy Policy
                        </a>
                        .
                    </p>

                    {/* Primary CTA Button */}
                    <button className="flex items-center justify-center w-full h-14 px-6 py-3 rounded-lg bg-primary text-white text-base font-bold leading-normal transition-colors hover:bg-primary/90">
                        Sign Up
                    </button>

                    {/* Social Login Section */}
                    <div className="flex items-center gap-4 py-8">
                        <hr className="flex-grow border-t border-secondary-light dark:border-secondary-dark/50" />
                        <p className="text-text-light/70 dark:text-text-dark/70 text-sm font-medium">
                            Or continue with
                        </p>
                        <hr className="flex-grow border-t border-secondary-light dark:border-secondary-dark/50" />
                    </div>

                    <div className="flex items-center justify-center gap-4">
                        <button className="flex items-center justify-center w-16 h-14 rounded-lg border border-secondary-light dark:border-secondary-dark bg-background-light dark:bg-background-dark transition-colors hover:bg-secondary-light/50 dark:hover:bg-secondary-dark/50">
                            <img
                                alt="Google logo"
                                className="h-6 w-6"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAs20R0snrajh-aGoWqN1gH_kKG240pj6zPlY5RbiZkvfjFjkaQYwYPRZQBBaW_z13ZYtnRuRQGcyv5HEM_heMBGOhRgKhhdlVho30PPcVhlSM6A4zoPC2OAtOyQj57aMx4t7VDHlnuejfNSdt3_2be3DMS9TGqGIFRNND3dWL5QF9l2GlBY8eQbHhNZh5YsgNrktVH6q5GzVnekMvFAAyayKVcdGhanqKOzGyrmzqQMITYXM_pR51vJ-LVt8vWu2Sv8w3mW9LpYI0j"
                            />
                        </button>

                        <button className="flex items-center justify-center w-16 h-14 rounded-lg border border-secondary-light dark:border-secondary-dark bg-background-light dark:bg-background-dark transition-colors hover:bg-secondary-light/50 dark:hover:bg-secondary-dark/50">
                            <img
                                alt="Facebook logo"
                                className="h-6 w-6"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCj6PiId3OpwE2jpZ_Hfb4D888aLAXLSmZpfw5Na5tu_qdTNQMiZTR9tzrlPVMDk8scEaw6TSW3vU5Or5dlAzYI6rUKgZdYFG7QzcGVCY1jKD6aVVMzfA8OS6VIk3JX0PFta4sw8r1DhiMaUEyaHs4YArrx1yK3lYyqTuy53QhS3ES8g2i0iwJwGwa3-nwZyqMHgfgs9TuK6oCRelSvXYcy87d1dB3jpn3DcefCL14WZM-dYySGDIDmAr7Nytcb-lzMnSmirEOw9rQI"
                            />
                        </button>
                    </div>

                    {/* Secondary Link */}
                    <p className="text-text-light dark:text-text-dark text-base font-normal text-center pt-8 pb-12">
                        Already have an account?{" "}
                        <a className="font-bold text-primary hover:underline" href="#">
                            Log In
                        </a>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default SignupPage