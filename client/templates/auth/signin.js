var ERRORS_KEY = 'signinErrors'

Template.signin.created = function() {
    Session.set(ERRORS_KEY, {})
};

Template.signin.helpers({
    errorMessages: function() {
        return _.values(Session.get(ERRORS_KEY))
    },
    errorClass: function(key) {
        return Session.get(ERRORS_KEY)[key] && 'error'
    }
})

Template.signin.events({
    'click .btn-facebook': function(event, template) {
        Meteor.loginWithFacebook({ requestPermissions: ['email']},
        function(error) {
            if (error) console.log(error)
            else Router.go('/')
        })
    },
    'click .btn-twitter': function(event, template) {
        Meteor.loginWithTwitter(function(error) {
            if (error) console.log(error)
            else Router.go('/')
        })
    },
    'submit': function(event, template) {
        event.preventDefault()

        var email = template.$('[name=email]').val()
        var password = template.$('[name=password]').val()

        var errors = {}

        if (! email) {
            errors.email = 'Email is required'
        }

        if (! password) {
            errors.password = 'Password is required'
        }

        Session.set(ERRORS_KEY, errors);
        if (_.keys(errors).length) {
            return
        }

        Meteor.loginWithPassword(email, password, function(error) {
            if (error) {
                return Session.set(ERRORS_KEY, {'none': error.reason})
            }

            Router.go('/')
        })
    }
})