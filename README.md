<a href="https://finances.executebig.org/">
<p align="center"><img width="100px" height="100px" alt="Hack Club icon" src="static/assets/icon.png"></p>
<h1 align="center"><strong>Goblin/Finances</strong></h1>
</a>

Goblin is [Execute Big](https://executebig.org)'s handler for accessing finance-related information. It is a part of our commitment to achieve 100% financial transparency.

Execute Big runs on [Mercury](https://mercury.com). This service interacts with the [Mercury API](https://mercury.com/api). Data is stored on [Airtable](https://airtable.com).

## Development

1. Clone this repo. 

1. Acquire a copy of the required environment variables from Execute Big. 
    * Unless you are contributing to the syncing engine between Mercury and Airtable, a Mercury API key is not required, and you can replace it with a random string for the time being. 
    * You will need a redacted copy of our Airtable data. Please acquire a template Airtable base by reaching out to us. 
    * You may skip over the admin dashboard's OAuth login locally by removing the `isUserAuthenticated` middleware from the admin router. If prompted for API keys before running, simply use a random string as a placeholder.  
    * Always use a read-only Mercury key. You may need to be IP whitelisted (if you do not have a stable IP address, let us know so we can help tunneling you through our server).

1. Update `PORT` to 3000 and `HOST` to `http://localhost:3000` or whatever you prefer your development server to be running on.

1. Run `yarn start`. Have fun!

## Notes

* `/api/stats` is an API endpoint used by the dashboard itself and our [donation](https://executebig.org/donate) to retrieve current financial data. It should always be calculating real-time numbers. 

## Bug Reporting

Bug reporting is always welcome!

For issues that are not security-related (does not impact data integrity, competition fairness, etc.), please simply create an issue in the GitHub Repository.

For security-related issues, please directly contact [mingjie@executebig.org](mailto:mingjie@executebig.org). Do not create a public issue.

Do not attempt to make changes on our production database. Do not perform any attack that could harm the integrity of our data. Do not publicly disclose a security-related bug before it has been patched.