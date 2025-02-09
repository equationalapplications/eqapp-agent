import React, { useRef, useState } from 'react'
import { Alert, StyleSheet, View } from 'react-native'
import { supabase } from '@/lib/supabaseClient'
import { Button, Input, Text, CheckBox } from '@rneui/themed'
import { Controller, useForm } from "react-hook-form"
import { validateEmailPattern, validatePasswordPattern } from '@/lib/validatePatterns'
import ReactNativeTurnstile, { resetTurnstile } from '@/components/ReactNativeTurnstile';
import { Link, router } from 'expo-router';
import { turnstileKey } from '@/constants'

interface FormData {
    username: string
    password: string
    confirmPassword: string
    agreed: boolean
    otp: string
}

export default function Auth() {
    const turnstileResetRef = useRef<any>(null);
    const { control, watch, handleSubmit, formState: { errors } } = useForm<FormData>();
    const [action, setAction] = useState<'signin' | 'create' | 'forgot' | 'otp'>('signin');
    const [captchaToken, setCaptchaToken] = useState('');
    const [loading, setLoading] = useState(false)
    const [password] = watch(["password"])
    if (turnstileKey === undefined) {
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
        if (error) {
            Alert.alert(error.message);
            setAction('signin');
            return;
        }
        router.replace('/(app)/home')
    };

    async function forgotPassword(data: FormData) {
        const { username } = data;
        if (!validateEmailPattern.test(username)) {
            Alert.alert('Invalid Email');
            return;
        }
        const { error } = await supabase.auth.signInWithOtp({
            email: username,
            options: {
                shouldCreateUser: false,
                captchaToken
            }
        })
        setLoading(false);
        resetTurnstile(turnstileResetRef);
        if (error) {
            Alert.alert(error.message);
            setAction('signin');
            return;
        }
        setAction('otp');
        Alert.alert('Please check your email for a one-time code.');
    };

    async function signInWithEmail(data: FormData) {
        const { username, password } = data;
        const { error } = await supabase.auth.signInWithPassword({
            email: username,
            password: password,
            options: { captchaToken },
        })
        setLoading(false);
        resetTurnstile(turnstileResetRef);
        if (error) {
            Alert.alert(error.message);
            setAction('signin');
            return;
        }
        router.replace('/(app)/home')
    };

    async function createWithEmail(data: FormData) {
        if (!data.agreed) {
            Alert.alert('You must agree to the Terms and Conditions.');
            return;
        };
        const { username, password } = data;
        const {
            data: { session },
            error,
        } = await supabase.auth.signUp({
            email: username,
            password: password,
            options: { captchaToken },
        })
        setLoading(false);
        resetTurnstile(turnstileResetRef);
        if (error) {
            Alert.alert(error.message);
            return;
        }
        if (!session) {
            setAction('otp');
            Alert.alert('Please check your email for a verification code.');
            return;
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

    type CaptureEvent = {
        nativeEvent: {
            data: string
        },
        markUsed: () => void
    }

    return (
        <View style={styles.container}>
            <Text style={styles.headerText}>Equational Applications LLC</Text>
            <Text style={styles.headerText}>{`${action === 'create' ? 'Create Account' : action === 'signin' ? 'Sign In' : 'Sign In with One-time Code'}`}</Text>
            <Controller
                control={control}
                name={'username'}
                rules={{
                    required: 'Please provide a valid email.',
                    minLength: 6,
                    pattern: {
                        value: validateEmailPattern,
                        message: 'Please provide a valid email.'
                    }
                }}
                render={({ field: { value, onChange, onBlur } }) => (
                    <Input
                        placeholder='Your email'
                        autoComplete='username'
                        style={styles.input}
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        errorStyle={styles.errorStyle}
                        errorMessage={errors?.username && errors.username.message}
                    />
                )}
            />
            {action === 'signin' && <Controller
                control={control}
                name={'password'}
                rules={{
                    required: true,
                    pattern: {
                        value: validatePasswordPattern,
                        message: 'Minimum 10 characters, including a letter and a number.'
                    }
                }}
                render={({ field: { value, onChange, onBlur } }) => (
                    <Input
                        placeholder='Your password'
                        autoComplete={'current-password'}
                        secureTextEntry={true}
                        style={styles.input}
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        errorStyle={styles.errorStyle}
                        errorMessage={errors?.password && errors.password.message}
                    />
                )}
            />}
            {action === 'create' && <>
                <Controller
                    control={control}
                    name={'password'}
                    rules={{
                        required: true,
                        pattern: {
                            value: validatePasswordPattern,
                            message: 'Minimum 10 characters, including a letter and a number.'
                        }
                    }}
                    render={({ field: { value, onChange, onBlur } }) => (
                        <Input
                            placeholder="New password"
                            autoComplete={'new-password'}
                            secureTextEntry={true}
                            style={styles.input}
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            errorStyle={styles.errorStyle}
                            errorMessage={errors?.password && errors.password.message}
                        />)}
                />
                <Controller
                    control={control}
                    name={'confirmPassword'}
                    rules={{
                        required: true,
                        validate: (value) => value === password || 'Passwords do not match.',
                    }}
                    render={({ field: { value, onChange, onBlur } }) => (
                        <Input
                            placeholder="Confirm password"
                            autoComplete={'new-password'}
                            secureTextEntry={true}
                            style={styles.input}
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            errorStyle={styles.errorStyle}
                            errorMessage={errors?.confirmPassword && errors.confirmPassword.message}
                        />)}
                />
                <View style={styles.terms} >
                    <Controller
                        control={control}
                        name={'agreed'}
                        rules={{
                            required: 'You must agree to the Terms and Conditions.',
                        }}
                        render={({ field: { value, onChange, onBlur } }) => (
                            <CheckBox
                                style={styles.input}
                                checked={value}
                                onBlur={onBlur}
                                onPress={() => onChange(!value)}
                            />)}
                    />
                    <Text> By clicking here, I state that I have read and understood the terms and conditions.</Text>
                </View>
                <Link target='_blank' href='https://equationalapplications.com/terms/' className="text-blue-500 underline">
                    Terms and Conditions
                </Link>
                {errors?.agreed && <Text style={styles.errorStyle}>
                    {errors.agreed.message}
                </Text>}
            </>}
            {action === 'otp' && <>
                <Controller
                    control={control}
                    name={'otp'}
                    rules={{
                        required: 'Please enter the six-digit code from your email.',
                    }}
                    render={({ field: { value, onChange, onBlur } }) => (
                        <Input
                            placeholder="One-time code"
                            autoComplete="one-time-code"
                            style={styles.input}
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            errorStyle={styles.errorStyle}
                            errorMessage={errors?.otp && errors.otp.message}
                        />)}
                />
            </>}
            <Button disabled={loading} onPress={handleSubmit(submit)}>
                {loading ?
                    <Text>Loading</Text> :
                    action === 'create' ?
                        <Text>Create Account</Text> :
                        action === 'signin' ?
                            <Text>Sign in</Text> :
                            action === 'forgot' ?
                                <Text>Get one-time code</Text> :
                                <Text>Submit one-time code</Text>}
            </Button>
            {
                action !== 'otp' && <ReactNativeTurnstile
                    sitekey={turnstileKey}
                    onVerify={token => setCaptchaToken(token)}
                    resetRef={turnstileResetRef}
                    style={{ marginLeft: 'auto', marginRight: 'auto' }}
                />
            }
            {
                action !== 'forgot' && <Button disabled={loading} onPress={toggleCreate} >
                    {loading ? <Text>Loading</Text> : action === 'signin' ? <Text>Create Account</Text> : <Text>Already have an account?</Text>}
                </Button>
            }
            {
                action !== 'create' && <Button disabled={loading} onPress={toggleForgot} >
                    {loading ? <Text>Loading</Text> : action !== 'forgot' ? <Text>Forgot password?</Text> : <Text>Already have a password?</Text>}
                </Button>
            }
        </View >
    )
}

const styles = StyleSheet.create({
    container: {
        gap: 20,
    },
    headerText: {
        fontSize: 18
    },
    errorStyle: {
        color: 'red'
    },
    input: {

    },
    terms: {
        flexDirection: 'row'
    }
});