import clipsLogo from '../assets/logos/clips-logo.png';
import collabsLogo from '../assets/logos/collabs-logo.png';
import historyLogo from '../assets/logos/history-logo.png';
import instantReactionsLogo from '../assets/logos/instant-reactions-logo.png';
import learnLogo from '../assets/logos/learn-logo.png';
import liveLogo from '../assets/logos/live-logo.png';
import logo from '../assets/logos/logo.png';
import predictionsLogo from '../assets/logos/predictions-logo.png';

const description = 'Pratyush and Aniket bring the F1 circus to your screen!';

export const pages = [
    {
        slug: undefined,
        title: 'Pod on the Apex',
        description,
        logo,
        category: 'podcast',
        itemsPerPage: 6,
        heroPadding: 'py-5',
        seasonTabs: true
    },
    {
        slug: 'shorts',
        title: 'Shorts | Pod on the Apex',
        description,
        logo,
        category: 'short',
        itemsPerPage: 12
    },
    {
        slug: 'predictions',
        title: 'Predictions on the Apex',
        description,
        logo: predictionsLogo,
        category: 'prediction',
        itemsPerPage: 6
    },
    {
        slug: 'learn',
        title: 'Learn on the Apex',
        description,
        logo: learnLogo,
        category: 'learn',
        itemsPerPage: 6
    },
    {
        slug: 'history',
        title: 'History on the Apex',
        description,
        logo: historyLogo,
        category: 'history',
        itemsPerPage: 12
    },
    {
        slug: 'instant-reactions',
        title: 'Instant Reactions on the Apex',
        description,
        logo: instantReactionsLogo,
        category: 'instant-reaction',
        itemsPerPage: 12
    },
    {
        slug: 'clips',
        title: 'Clips on the Apex',
        description,
        logo: clipsLogo,
        category: 'clip',
        itemsPerPage: 6
    },
    {
        slug: 'collabs',
        title: 'Collabs on the Apex',
        description,
        logo: collabsLogo,
        category: 'collab',
        itemsPerPage: 6
    },
    {
        slug: 'live',
        title: 'Live on the Apex',
        description,
        logo: liveLogo,
        category: 'live',
        itemsPerPage: 6
    }
];
