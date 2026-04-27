const siteConfig = {
    /*
     * Set to false to hide a section.
     * - Removes the nav link
     * - Redirects any direct URL hash to home
     * - 'projects' also hides the Recent Projects block on the home page
     * - 'contact' hides the Contact nav link (the form on home stays visible)
     */
    pages: {
        about:      true,
        projects:   true,
        playground: true,
        join:       true,
        contact:    false,
    },

    /*
     * Number of months without a GitHub push before the stale warning appears
     * on the home page. Set to 0 to disable the warning entirely.
     */
    staleWarningMonths: 6,
};
