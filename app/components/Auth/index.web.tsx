import React, { useRef, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Turnstile } from '@/components/Turnstile';

import { useForm } from "react-hook-form";
import { validateEmailPattern, validatePasswordPattern } from '../../lib/validatePatterns';
import { router } from 'expo-router';
import './styles.css';

const dev = process.env.NODE_ENV === 'development';
interface FormData {
    username: string
    password: string
    confirmPassword: string
    agreed: boolean
    otp: string
}

export default function Auth() {
    const siteKey = process.env.EXPO_PUBLIC_TURNSTILE_SITE_KEY;
    const { register, watch, handleSubmit, formState: { errors } } = useForm<FormData>();
    const [action, setAction] = useState<'signin' | 'create' | 'forgot' | 'otp'>('signin');
    const [loading, setLoading] = useState(false);
    const [password] = watch(["password"])
    const turnstileRef = useRef<any>(null);
    if (siteKey === undefined) {
        throw new Error('No turnstile key');
    }

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
        router.replace('/(app)/home')
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
                emailRedirectTo: dev ? 'http://localhost:5173' : 'https://user.equationalapplications.com/',
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
        router.replace('/(app)/home')
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
        router.replace('/(app)/home')
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
        <div className="row flex flex-center">
            <div className="col-6 form-widget">
                <h1 className="header">Equational Applications LLC</h1>
                <h2 className="description">{`${action === 'create' ? 'Create Account' : action === 'signin' ? 'Sign In' : 'Sign In with One-time Code'}`}</h2>
                <form className="form-widget" onSubmit={handleSubmit(submit)} >
                    <label>
                        Email
                        <input
                            className="inputField"
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
                        {errors?.username && errors.username.message}
                    </label>
                    {action === 'signin' && <label>
                        Password
                        <input
                            className="inputField"
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
                        {errors?.password && errors.password.message}
                    </label>}
                    {action === 'create' && <>
                        <label>
                            New Password
                            <input
                                className="inputField"
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
                            {errors?.password && errors.password.message}
                        </label>
                        <label>
                            Confirm Password
                            <input
                                className="inputField"
                                type="password"
                                autoComplete={'new-password'}
                                placeholder="Confirm password"
                                {...register('confirmPassword', {
                                    required: true,
                                    validate: (value) => value === password || 'Passwords do not match.',
                                })}
                            />
                            {errors?.confirmPassword && errors.confirmPassword.message}
                        </label>
                        <label>
                            <div className='flex' >
                                <input
                                    id="terms"
                                    className="inputField checkbox-lg"
                                    type="checkbox"
                                    {...register('agreed', {
                                        required: 'You must agree to the Terms and Conditions.',
                                    })}
                                />
                                <p className='terms-text'>
                                    By clicking here, I state that I have read and understood the terms and conditions.
                                </p>
                            </div>
                            <a target='_blank' href='https://equationalapplications.com/terms/' className="text-blue-500 underline">
                                Terms and Conditions
                            </a>
                            {errors?.agreed && <>
                                < br />
                                < br />
                                <p>
                                    {errors.agreed.message}
                                </p>
                            </>}
                        </label>
                    </>}
                    {action === 'otp' && <label>
                        One-time Code
                        <input
                            className="inputField"
                            type="text"
                            placeholder="One-time code"
                            autoComplete="one-time-code"
                            inputMode="numeric"
                            maxLength={6}
                            {...register('otp', {
                                required: 'Please enter the six-digit code from your email.',
                            })}
                        />
                        {errors?.otp && errors.otp.message}
                    </label>}
                    <div>
                        <button className={`button block primary`} disabled={loading} >
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
                    <div>
                        {action !== 'otp' && <Turnstile
                            ref={turnstileRef}
                            siteKey={siteKey}
                        />}
                    </div>
                </form>
                {action !== 'forgot' && <button className={'button block'} disabled={loading} onClick={toggleCreate} >
                    {loading ? <span>Loading</span> : action === 'signin' ? <span>Create Account</span> : <span>Already have an account?</span>}
                </button>}
                {action !== 'create' && <button className={'button block'} disabled={loading} onClick={toggleForgot} >
                    {loading ? <span>Loading</span> : action !== 'forgot' ? <span>Forgot password?</span> : <span>Already have a password?</span>}
                </button>}
            </div>
        </div>
    )
}