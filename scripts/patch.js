const { writeFileSync, readFileSync, copyFileSync } = require('fs');

function patch(path, searchValue, replaceValue) {
  writeFileSync(path, readFileSync(path).toString().replace(searchValue, replaceValue));
}

patch(
  'node_modules/hexo-theme-icarus/layout/common/article.jsx',
  /[^\n]+article-more[^\n]+/,
  '',
)

patch(
  'node_modules/hexo-theme-icarus/layout/common/article.jsx',
  /class="card"/,
  'class={index ? "card card-preview" : "card"}',
)

patch(
  'node_modules/hexo-theme-icarus/layout/common/widgets.jsx',
  /is-4-tablet is-4-desktop is-4-widescreen/,
  'is-4-tablet is-3-desktop is-3-widescreen'
)

patch(
  'node_modules/hexo-theme-icarus/layout/layout.jsx',
  /is-8-tablet is-8-desktop is-8-widescreen/,
  'is-8-tablet is-9-desktop is-9-widescreen'
)

patch(
  'node_modules/hexo-theme-icarus/include/style/helper.styl',
  /42.8%/,
  '50%',
)

patch(
  'node_modules/hexo-theme-icarus/include/style/responsive.styl',
  /align-self: flex-start\n\n\+mobile\(\)/,
  `align-self: flex-start

    .card-preview
        display: flex
        .card-image
            border-top-right-radius: 0
            border-bottom-left-radius: 4px
            width: 200px
            height: auto
            flex-shrink: 0
            .is-7by3
                height: 100%
                padding-top: 100%

+mobile()`,
)

patch(
  'node_modules/hexo-theme-icarus/include/style/article.styl',
  /white-space: normal\n?$/,
  `white-space: normal

article.article .content img
    border: 1px solid #bbbbbb;
    box-shadow: 0px 2px 8px rgba(0,0,0,0.3);\n`,
)

patch(
  'node_modules/hexo-theme-icarus/include/style/widget.styl',
  /white-invert\n?$/,
  `white-invert

#toc
    position: -webkit-sticky;
    position: sticky;
    top: 1.5rem;
    z-index: 99;
    
    .level-item
        word-break: break-all;\n`,
)

const highlightAliasJsonPath = 'node_modules/hexo-util/highlight_alias.json';
const highlightAliasJson = JSON.parse(readFileSync(highlightAliasJsonPath).toString());
if (!highlightAliasJson.languages.includes('graphql')) {
  highlightAliasJson.languages.push('graphql');
}
highlightAliasJson.aliases['graphql'] = 'graphql';
highlightAliasJson.aliases['gql'] = 'graphql';
writeFileSync(highlightAliasJsonPath, JSON.stringify(highlightAliasJson, null, 2));

const graphqlLanguageFilePathSrc = 'scripts/highlight.js/graphql.js';
const graphqlLanguageFilePathDist = 'node_modules/highlight.js/lib/languages/graphql.js';
copyFileSync(graphqlLanguageFilePathSrc, graphqlLanguageFilePathDist);

patch(
  'node_modules/highlight.js/lib/index.js',
  `hljs.registerLanguage('zephir', require('./languages/zephir'));\n\n`,
  `hljs.registerLanguage('zephir', require('./languages/zephir'));\nhljs.registerLanguage('graphql', require('./languages/graphql'));\n\n`,
)
