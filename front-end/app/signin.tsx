import React from 'react';
import { StyleSheet } from 'react-native';
import { View } from '@/components/Themed';
import Auth from '@/components/Auth';
import { useSession } from '@/hooks/useSession';
import { Redirect } from 'expo-router';

export default function SigninModal() {
    const { session } = useSession();
    if (session) {
        return <Redirect href="/(app)/home" />;
    }

    return (
        <View style={styles.container}>
            <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
            <Auth />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    separator: {
        marginVertical: 30,
        height: 1,
        width: '80%',
    },
});