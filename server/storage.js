/**
 * File storage configurations
 */

// Generic image upload rules
Slingshot.createDirective('image', Slingshot.S3Storage, {
    bucket: 'recoverize-app',
    allowedFileTypes: ['image/png', 'image/jpeg'],
    maxSize: 500000,
    acl: 'public-read',

    authorize: function () {
        // Deny uploads if user is not logged in.
        if (!this.userId) {
            var message = 'Please login before posting files';
            throw new Meteor.Error('Login Required', message);
        }

        return true;
    },

    key: function (file) {
        // Store file into a directory by the user's username.
        var user = Meteor.users.findOne(this.userId);
        return user.username + '/' + file.name;
    }
});

