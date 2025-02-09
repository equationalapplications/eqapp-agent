import React from 'react';
import { StyleSheet } from 'react-native';
import { View } from '@/components/Themed';
import { Link } from 'expo-router';

export default function SigninModal() {

    return (
        <View style={styles.container}>
            <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
            <View>
                <Link href={'/(app)/home'}>
                    Enter
                </Link>
            </View>
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