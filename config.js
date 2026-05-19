const siteConfig = {
    /*
     * Set to false to hide a section.
     * - Removes the nav link
     * - Redirects any direct URL hash to home
     * - 'projects' also hides the Recent Projects block on the home page
     * - 'contact' hides the Contact nav link (the form on home stays visible)
     */
    pages: {
        about: true,
        projects: true,
        playground: true,
        join: true,
        contact: false,
    },

    /*
     * Microsoft Clarity project ID for visitor analytics (heatmaps, session recordings).
     * Get yours at https://clarity.microsoft.com/ — replace the placeholder below.
     * Set to null or empty string to disable Clarity entirely.
     */
    clarityId: 'wtfvkk0n07',

    /*
     * Number of months without a GitHub push before the stale warning appears
     * on the home page. Set to 0 to disable the warning entirely.
     */
    staleWarningMonths: 6,

    /*
     * Project category tabs shown on the Projects page.
     * Each entry must match the exact value used in the Project_Category
     * column of data.xlsx (case-sensitive).
     *
     * To add a new category:
     *   1. Add an entry here with its EN and TH labels.
     *   2. Use the same `value` string in the Project_Category column.
     *   3. Update categorize-projects.js if you use that script.
     */
    projectCategories: [
        { value: 'Software', en: 'Software', th: 'ซอฟต์แวร์' },
        { value: 'Game', en: 'Game', th: 'เกม' },
        { value: 'etc.', en: 'etc.', th: 'อื่นๆ' },
    ],
};
