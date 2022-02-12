## Product stuff

- Add shadows on scroll views / flat lists
- List items in slight shadows to act as dividers
- Check phone sign in works still
- Add todo form to end of plant creation journey
- Plant creation journey via suggestion should pre-fill name instead of prompt for nickname
- List of todos in plant screen should give a small summary i.e. Water every week, Mist every 2 weeks in June, July, August
- Overdue label against a todo?
- Add urban jungle logo to top left of home screen. Press to show a modal route with a little explainer about what it's about
- Home screen when there's no plants saved - prompt to create one

## Bugs / tech stuff

- Add Sentry
- Tweak spacing depending on device size (this will require either using theme or custom spacing depending on Dimensions.get() etc)
- Move plant creation progress bar to navigation options (this will require a custom header)
- Fix android section list sticky headers not working
- Fix android root colour on dark theme (back looks bad)
- Fix android navigation header buttons (back button and modal close button)
- Upgrade reanimated stuff, or remove if not needed
- Find better solution for bottom sheets - react-navigation modal route?
- Fix camera upload
- Remove duplicate plant photo stuff - just use plant avatar property for both views
- Fix push notifications (now cares have been removed)
- Upgrade firebase from 8 to 9
- Remove "realtime" stuff - not necessary
- Fix all the TS errors
- Move away from moment to datefns
- Remove unnecessary state/selectors/effects/mutations
- Remove unused theme properties
