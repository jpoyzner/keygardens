# Keygardens

## Proposed Requirements

Rebuild the current site at keygardens.ca using the most modern technologies. After it is built locally we will host it (see Questions section below), some domain (e.g. keygrdens.ca) will have to be pointed to the site for users to access it (that part won't be done by us). We will reuse the images & products available already. We will remove the GoDaddy advertisement on the top bar.

The rebuilt pages will include the following features:
- Search
- Shopping Cart (with real checkout)
- Contact/Feedback
- Account creation & Sign-in
- Profile/Orders screen
- Email subscription sign-up
- full SPA URL-syncing for better bookmarking
- Products pages with previews & navigation (both all products and sub-categories)
- Sorting for product pages (popularity, newness, price, alphabetical)
- Product detail pages with zooming, and add-to-cart funcitonality (and social media sharing)
- Admin-only pages to manage products (add, modify, remove, etc...)
- "Coming soon" slide show page (also editable through admin screens)
- You can suggest other features, but I need to pre-approve before you implement them

## Personal payout

- 10% of profit of all sales need to go to my own separate payment system (paypal?), but the user should not be aware of this. Perhaps two actual transations need to happen behind the scenes? I'm not sure.

## Items outside of this development

- $200 development fee (done)
- domain, pointed to site (we won't do this)
- If we can't scrape them from the site directly, someone will need to create static resources like images
- payment account available for integrating to checkout (e.g. paypal). However, I might still need information on the best way to do this.

### Questions to resolve & other concerns

- Can this be deployed on GitHub pages and have the domain point to that?
- Make sure pointing a domain to the site will not disrupt URL updates as person uses the site.
- If github pages can't access db, then maybe a static file can be used? But then would it be able to update it through the admin pages of the site? See if AI has a better suggestion for this.
- Can test everything locally first, but see notes above for access once deployed, so it does not change too radically for real deployment

- Will need some mock payment system to test it, or is there a better way to handle this?
