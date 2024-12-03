# App Name 📺

MoviesTracker

# Project Group-6 🤙

Yichen Wang && Wangfan Qian

# API (tmdb) 

**Pleaes find and paste API in the assignment comment in Canvas to your .env file to run.**
  
# Firebase Rules:

### Database:

    rules_version = '2';
    
    service cloud.firestore {
      match /databases/{database}/documents {
        match /bookmarks/{bookmarkId} {
          // Only allow users to read their own bookmarks
          allow read: if request.auth != null && resource.data.userId == request.auth.uid;
          // Only allow authenticated users to create bookmarks with their own userId
          allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
          // Only allow users to modify or delete their own bookmarks
          allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
        }
        match /reviews/{reviewId} {
          // Allow anyone to read reviews
          allow read: if true;
          // Only allow authenticated users to create reviews with their own userId
          allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
          // Only allow users to modify or delete their own reviews
          allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
        }
        
        match /users/{userId} {
          // Allow users to read and write only their own documents
          allow read, write: if request.auth != null && request.auth.uid == userId;
        }
        
        // TV Show reviews
        match /tvshowreviews/{reviewId} {
          // Allow anyone to read reviews
          allow read: if true;
          // Only allow authenticated users to create reviews with their own userId
          allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
          // Only allow users to modify or delete their own reviews
          allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
        }
        
        // TV Show bookmarks
        match /tvshowbookmarks/{bookmarkId} {
          // Only allow users to read their own bookmarks
          allow read: if request.auth != null && resource.data.userId == request.auth.uid;
          // Only allow authenticated users to create bookmarks with their own userId
          allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
          // Only allow users to modify or delete their own bookmarks
          allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
        }
      }
    }

### Storage

    rules_version = '2';
    
    service firebase.storage {
      match /b/{bucket}/o {
        match /review_images/{imageId} {
          allow write: if request.auth != null;
          allow read: if true;
        }
        match /profile_images/{userId} {
          // Allow users to read and write only their own profile images
          allow read, write: if request.auth != null && request.auth.uid == userId;
        }
        
        match /tvshow_review_images/{userId}/{imageId} {
          allow read: if true;
          allow write: if request.auth != null;
        }
      }
    }


# Iteration 3 Contribution

Yichen Wang 👍👍👍

* Resolved an issue where the bookmark content remained from the previous account after switching accounts. The bug was due to the system still using the old account information when requesting data from the database.
* Added a "Back" button on the login and register screens for easier navigation.
* Implemented a password recovery feature, which sends a password reset email to the user's registered email address.
* Added a prompt during account registration to encourage users to choose a strong password.

Wangfan Qian 👍👍👍
* Fix datepicker functionality on Android and add alerts to ensure users can only select future dates for reminders.
* Add a back button on the cinema details screen to enhance user experience.
* Optimize styling.
* Resolve notification issues on certain devices.

# Iteration 3 Update

**Bug Fix** 🥷
* Resolved issue where bookmark content remained from the previous account after switching accounts.
* Fixed datepicker functionality on Android to ensure users can only select future dates for reminders.
* Resolved notification issues on certain devices.

**New Features** ⛄️
* Added a "Back" button on login and registration screens for easier navigation.
* Implemented password recovery feature with email reset option.
* Added prompt during account registration to encourage strong password selection.
* Added back button on the cinema details screen to enhance user experience.
* Optimized styling across the app.


# Project Overview

Experience cinema like never before! Track favorites, write comments, discover new films, and find nearby cinemas on the map. Join a community of movie lovers and enhance your cinematic adventures!

# App Functionality

* **CRUD Operations:** Users can create, read and delete data about their reviews, favorites, and personal info, and take Pictures.
* **Movies Recommendation:** Discover popular movies and shows across various categories and genres based on the current trends.
* **Movies Search:** Search through a vast collection of movies and TV shows to find exactly what you’re looking for.
* **Favorites & Sorting:** Save your favorite movies for easy access and organize your collection with sorting options.
* **Notifications:** Set reminders for upcoming releases or movies on your watchlist to ensure you never miss a movie.
* **Location Tagging:** See your moive theaters nearby.

# Data Model and Firebase Collections

## Firestore Collections

### 1. Reviews

Stores user reviews for movies.

**Fields:**

* `movieId` (string): Identifier of the movie being reviewed.
* `text` (string): Content of the review.
* `timestamp` (timestamp): Time when the review was created or last updated.
* `userId` (string): Identifier of the user who wrote the review.
* `userName` (string): Name of the user who wrote the review.

**CRUD Operations:**

* **Create:** When a user submits a new review.
* **Read:** Fetching all reviews for a specific movie.
* **Update:** When a user edits their existing review.
* **Delete:** When a user deletes their review.

### 2. Bookmarks

Stores information about movies bookmarked by users.

**Fields:**

* `director` (string): Director of the movie.
* `genres` (array of strings): Array of genres of the movie.  *(Improved from comma-separated string)*
* `movieId` (string): Identifier of the bookmarked movie.
* `movieTitle` (string): Title of the bookmarked movie.
* `posterPath` (string): Path to the movie’s poster image (pointing to Firebase Storage).
* `bookmarkId` (string): Unique identifier for the bookmark (auto-generated).
* `userId` (string): Identifier of the user who bookmarked the movie.
* `releaseDate` (timestamp): Release date of the movie.
* `timestamp` (timestamp): Time when the movie was bookmarked.

**CRUD Operations:**

* **Create:** When a user bookmarks a movie.
* **Read:** Fetching all bookmarks for a user.
* **Update:** (Optional) Update bookmark details if necessary.
* **Delete:** When a user removes a bookmark.

### 3. Users

Stores user profile information

**Fields:**

* `userId` (string): Identifier of the user who bookmarked the movie.
* `birthdate`(timestamp): when birthdate
* `gender`(string): what gender

**CRUD Operations:**

* **Create:** Create birthdate and choose gender
* **Read:** Fetching all personal info for a user.
* **Update:** Update the personal info
* **Delete:**  (Optional)

## Firebase Storage Structure

Firebase Storage would primarily be used to store:

### 1. Profile Pictures

* __Structure__:  `profile_images/${user.uid}`
* __Description__: store the profile Pictures
* __Usage__: When users upload or change their profile picture, the image is stored in this folder under a subfolder named after their userId.

### 2. Review Images
* Structure: `review_images/${user.uid}/${imageId}`
* Description: Stores images uploaded by users as part of their reviews.
* Usage: When users upload images for their movies reviews, the images are stored in this folder under * subfolders named after their userId and imageId.

### 2. TVshow Images
* Structure: `tvshows_images/${user.uid}/${imageId}`
* Description: Stores images uploaded by users as part of their reviews.
* Usage: When users upload images for their TV show reviews, the images are stored in this folder under * subfolders named after their userId and imageId.

# Screenshots

* **Photo1: Home Page**

  1. Features four navigation stacks at the bottom.
  2. Includes two main tabs: Movies and TV Shows.
     ![Image Description](https://i.imgur.com/dXfv79E.png)
* **Photo2: Search Functionality**

  1. Access the search box on the home screen to find desired movies.
     ![Image Description](https://i.imgur.com/n2RcWIH.png)
* **Photo3:  Movie Details Page**

  1. Click on a movie to view its details.
  2. Favorite the movie by clicking the flag icon.
  3. Add, edit, or delete comments using the floating action button.
     ![Image Description](https://i.imgur.com/CQEKUfh.png)
* **Photo4: Review Management (CRUD Operations)**

  1. perform Create, Read, Update, and Delete (CRUD) operations on reviews.
  2. Use camera and add picture to comment
     ![Image Description](https://i.imgur.com/FkkCiuJ.png)

* **Photo5: Notification  (CRUD Operations)**

  1. Set alerts about new movies
     ![Image Description](https://i.imgur.com/U239Cfx.png)

* **Photo6: Saved Movies Tab**

  1. In the second tab, view saved movies.
  2. Sort movies by release year and date added.
     ![Image Description](https://i.imgur.com/okrLNLd.png)
* **Photo7: Account Tab**

  1. Option to log out.
  2. Edit personal information by clicking Edit Profile.
     ![Image Description](https://i.imgur.com/anEioDE.png)
* **Photo8: Edit Profile Screen**

  * Edit your name, birthdate, and gender.
  * Upload or change your profile picture.
    ![Image Description](https://i.imgur.com/RciD42C.png)

* **Photo9: Help and support Screen**

  * Enter from Account Tab
  * Find the help info about how to use our app
    ![Image Description](https://i.imgur.com/IezOgYu.png)

* **Photo10: About Screen**

  * Info about our app
    ![Image Description](https://i.imgur.com/yXr3EU4.png)


* **Photo11: Map Screen**

  * find the theaters naerby( Location function)
    ![Image Description](https://i.imgur.com/D8Vbzbo.png)


```
