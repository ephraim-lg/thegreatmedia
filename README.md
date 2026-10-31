# The Great Media — thegreatmediazm.com

The live agency site: one funnel that sells a customer acquisition system.

## Where to make changes

| You want to change | Edit this |
| --- | --- |
| Words or sections on a page | `src/pages/<page>.html` |
| Menu, footer, pixel, WhatsApp number (every page) | `tools/build.js` |
| Colours, fonts, spacing | `public/css/site.css` |
| Monthly slots ("2 of 3 open") | `TGM_CAPACITY` in `public/js/site.js` |
| The /apply questions | `src/pages/apply.html` + `public/js/apply.js` |
| Images | `public/img/` |

After editing anything in `src/pages` or `tools/build.js`, rebuild the pages:

```
node tools/build.js
```

This rewrites `public/*.html`. Do not edit `public/*.html` by hand: the next build overwrites it.

## Going live

Pushing to GitHub does **not** update the website. The site is served by the Cloudflare Worker `morning-shape-c2bc`, which is not connected to this repo. To publish, deploy `public/` with the steps in `DEPLOY.md`. Always deploy the whole `public/` folder including `img/`: a deploy without images removes them from the live site.

`workers/tgm-leads-api.js` is the lead form's backend. Read `CLAUDE.md` before changing it.
