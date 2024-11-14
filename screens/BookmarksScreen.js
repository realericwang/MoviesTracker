import React, {useEffect, useState} from 'react';
import {FlatList, Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {auth} from '../firebase/firebaseSetup';
import {getDocsByQuery} from '../firebase/firestoreHelper';
import {getImageUrl} from '../api/tmdbApi';
import {colors, spacing} from '../styles/globalStyles';

export default function BookmarksScreen() {
    const [bookmarkedMovies, setBookmarkedMovies] = useState([]);
    const navigation = useNavigation();
    const user = auth.currentUser;

    useEffect(() => {
        return navigation.addListener('focus', () => {
            fetchBookmarkedMovies();
        });
    }, [navigation]);

    const fetchBookmarkedMovies = async () => {
        if (!user) {
            setBookmarkedMovies([]);
            return;
        }
        try {
            const bookmarksData = await getDocsByQuery('bookmarks', 'userId', '==', user.uid);
            setBookmarkedMovies(bookmarksData);
        } catch (error) {
            console.error('Error fetching bookmarks:', error);
        }
    };

    const renderItem = ({item}) => (
        <TouchableOpacity
            style={styles.movieItem}
            onPress={() => navigation.navigate('MovieDetail', {movieId: item.movieId})}
        >
            <Image
                source={{uri: getImageUrl(item.posterPath)}}
                style={styles.poster}
            />
            <Text style={styles.title}>{item.movieTitle}</Text>
        </TouchableOpacity>
    );

    if (!user) {
        return (
            <View style={styles.container}>
                <Text>Please log in to view your bookmarks.</Text>
            </View>
        );
    }

    if (bookmarkedMovies.length === 0) {
        return (
            <View style={styles.container}>
                <Text>No bookmarks yet.</Text>
            </View>
        );
    }

    return (
        <FlatList
            data={bookmarkedMovies}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContainer}
        />
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: spacing.lg,
        backgroundColor: colors.background,
    },
    listContainer: {
        padding: spacing.sm,
        backgroundColor: colors.background,
    },
    movieItem: {
        flexDirection: 'row',
        marginBottom: spacing.md,
        alignItems: 'center',
    },
    poster: {
        width: 80,
        height: 120,
        borderRadius: 8,
        backgroundColor: colors.border,
        marginRight: spacing.md,
    },
    title: {
        fontSize: 16,
        color: colors.text,
        flexShrink: 1,
    },
});