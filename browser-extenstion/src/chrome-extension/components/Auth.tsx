import { useRef, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Turnstile } from '@marsidev/react-turnstile'
import { useForm } from "react-hook-form";
import { validateEmailPattern, validatePasswordPattern } from '../lib/validatePatterns';

const isDev = import.meta.env.DEV;
const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

interface FormData {
    username: string
    password: string
    confirmPassword: string
    agreed: boolean
    otp: string
}

export default function Auth() {
    const turnstileRef = useRef<any>(null);
    const { register, watch, handleSubmit, formState: { errors } } = useForm<FormData>();
    const [action, setAction] = useState<'signin' | 'create' | 'forgot' | 'otp'>('signin');
    const [loading, setLoading] = useState(false);
    const [password] = watch(["password"])

    function toggleCreate() {
        const newAction = action === 'signin' ? 'create' : 'signin';
        setAction(newAction);
    };

    function toggleForgot() {
        const newAction = action === 'forgot' ? 'signin' : 'forgot';
        setAction(newAction);
    };

    async function verifyOTP(data: FormData) {
        const { username, otp } = data;
        const { error } = await supabase.auth.verifyOtp({
            email: username,
            token: otp,
            type: 'email',
        })
        setLoading(false);
        if (error) {
            alert(error.message);
            setAction('signin');
            return;
        }
    };

    async function forgotPassword(data: FormData) {
        const { username } = data;
        if (!validateEmailPattern.test(username)) {
            alert('Invalid Email');
            return;
        }
        const captchaToken: string | undefined = turnstileRef?.current?.getResponse();
        const { error } = await supabase.auth.signInWithOtp({
            email: username,
            options: {
                emailRedirectTo: isDev ? 'http://localhost:5173' : 'https://user.equationalapplications.com/',
                shouldCreateUser: false,
                captchaToken
            }
        })
        setLoading(false);
        turnstileRef?.current?.reset();
        if (error) {
            alert(error.message);
            setAction('signin');
            return;
        }
        setAction('otp');
        alert('Please check your email for a one-time code.');
    };

    async function signInWithEmail(data: FormData) {
        const { username, password } = data;
        const captchaToken: string | undefined = turnstileRef?.current?.getResponse();
        const { error } = await supabase.auth.signInWithPassword({
            email: username,
            password: password,
            options: { captchaToken },
        })
        setLoading(false);
        turnstileRef?.current?.reset();
        if (error) {
            alert(error.message);
            setAction('signin');
            return;
        }
    };

    async function createWithEmail(data: FormData) {
        if (!data.agreed) {
            alert('You must agree to the Terms and Conditions.');
            return;
        };
        const { username, password } = data;
        const captchaToken: string | undefined = turnstileRef?.current?.getResponse();
        const {
            data: { session },
            error,
        } = await supabase.auth.signUp({
            email: username,
            password: password,
            options: { captchaToken },
        })
        setLoading(false);
        turnstileRef?.current?.reset();
        if (error) {
            alert(error.message);
            return;
        }
        if (!session) {
            setAction('otp');
            alert('Please check your email for a verification code.');
        }
    };

    async function submit(data: FormData) {
        setLoading(true);
        switch (action) {
            case 'signin':
                await signInWithEmail(data);
                break;
            case 'create':
                await createWithEmail(data);
                break;
            case 'forgot':
                await forgotPassword(data);
                break;
            case 'otp':
                await verifyOTP(data);
                break;
        }
    };

    return (
        <div className="auth-container">
            <h1 className="auth-title">EqApp Agent</h1>
            <h2 className="auth-subtitle">{`${action === 'create' ? 'Create Account' : action === 'signin' ? 'Sign In' : 'Sign In with One-time Code'}`}</h2>
            <form className="auth-form" onSubmit={handleSubmit(submit)} >
                <label className="auth-label">
                    Email
                    <input
                        className="auth-input"
                        type="email"
                        autoComplete='username'
                        placeholder="Your email"
                        {...register('username', {
                            required: 'Please provide a valid email.',
                            minLength: 6,
                            pattern: {
                                value: validateEmailPattern,
                                message: 'Please provide a valid email.'
                            }
                        })}
                    />
                    {errors?.username && <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
                </label>
                {action === 'signin' && <label className="auth-label">
                    Password
                    <input
                        className="auth-input"
                        type="password"
                        autoComplete={'current-password'}
                        placeholder="Your password"
                        {...register('password', {
                            required: true,
                            pattern: {
                                value: validatePasswordPattern,
                                message: 'Minimum 10 characters, including a letter and a number.'
                            }
                        })}
                    />
                    {errors?.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                </label>}
                {action === 'create' && <>
                    <label className="auth-label">
                        New Password
                        <input
                            className="auth-input"
                            type="password"
                            autoComplete={'new-password'}
                            placeholder="New password"
                            {...register('password', {
                                required: true,
                                pattern: {
                                    value: validatePasswordPattern,
                                    message: 'Minimum 10 characters, including a letter and a number.'
                                }
                            })}
                        />
                        {errors?.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                    </label>
                    <label className="auth-label">
                        Confirm Password
                        <input
                            className="auth-input"
                            type="password"
                            autoComplete={'new-password'}
                            placeholder="Confirm password"
                            {...register('confirmPassword', {
                                required: true,
                                validate: (value) => value === password || 'Passwords do not match.',
                            })}
                        />
                        {errors?.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
                    </label>
                    <label className="auth-label">
                        <div className='flex items-center'>
                            <input
                                id="terms"
                                className="form-checkbox h-4 w-4 text-blue-600"
                                type="checkbox"
                                {...register('agreed', {
                                    required: 'You must agree to the Terms and Conditions.',
                                })}
                            />
                            <span className="ml-2 text-xs text-gray-700">By clicking here, I state that I have read and understood the terms and conditions.</span>
                        </div>
                        <a target='_blank' href='https://equationalapplications.com/terms/' className="text-blue-500 underline text-xs">
                            Terms and Conditions
                        </a>
                        {errors?.agreed && <p className="text-red-500 text-xs mt-1">{errors.agreed.message}</p>}
                    </label>
                </>}
                {action === 'otp' && <label className="auth-label">
                    One-time Code
                    <input
                        className="auth-input"
                        type="text"
                        placeholder="One-time code"
                        autoComplete="one-time-code"
                        inputMode="numeric"
                        maxLength={6}
                        {...register('otp', {
                            required: 'Please enter the six-digit code from your email.',
                        })}
                    />
                    {errors?.otp && <p className="text-red-500 text-xs mt-1">{errors.otp.message}</p>}
                </label>}
                <div>
                    <button className={`auth-button ${loading ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={loading} >
                        {loading ?
                            <span>Loading</span> :
                            action === 'create' ?
                                <span>Create Account</span> :
                                action === 'signin' ?
                                    <span>Sign in</span> :
                                    action === 'forgot' ?
                                        <span>Get one-time code</span> :
                                        <span>Submit one-time code</span>}
                    </button>
                </div>
                {action !== 'otp' && <Turnstile
                    ref={turnstileRef}
                    siteKey={siteKey}
                />}
            </form>
            {action !== 'forgot' && <button className={'auth-link'} disabled={loading} onClick={toggleCreate} >
                {loading ? <span>Loading</span> : action === 'signin' ? <span>Create Account</span> : <span>Already have an account?</span>}
            </button>}
            {action !== 'create' && <button className={'auth-link'} disabled={loading} onClick={toggleForgot} >
                {loading ? <span>Loading</span> : action !== 'forgot' ? <span>Forgot password?</span> : <span>Already have a password?</span>}
            </button>}
        </div>
    )
}