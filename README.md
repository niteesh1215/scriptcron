# Node.js Agent Application

## Project Overview
This application is a Node.js-based agent that periodically executes scripts based on a configuration file. It supports dynamic arguments, schedules tasks using cron expressions, and logs both agent activity and script outputs to dedicated log files.

## Directory Structure
```
/project-root
├── src/                # Main application code
│   ├── agent.js        # Main agent script
│   └── scripts/        # Directory to store example shell scripts
│       ├── script1.sh
│       └── script2.sh
├── tests/              # Directory for test files
│   ├── agent.test.js    # Tests for the main agent
│   ├── script1.test.js   # Tests for script1
│   └── script2.test.js   # Tests for script2
├── logs/               # Directory for script-specific log files
├── config.json         # Configuration file for script details
├── .gitignore          # Git ignore file
└── README.md           # Project documentation
```

## Installation
1. Clone the repository.
2. Navigate to the project directory.
3. Install dependencies:
   ```bash
   npm install
   ```

## Configuration Guide
Update the `config.json` file to define the scripts to be executed:
```json
{
  "scripts": [
    {
      "name": "script1.sh",
      "enabled": true,
      "args": ["arg1", "arg2"],
      "frequency": "*/5 * * * *"
    }
  ]
}
```

## Usage
Run the agent using:
```bash
node src/agent.js
```

## Logs
Logs are saved in the `logs/` directory (e.g., `script1.sh.log`).

## Testing
To run the tests, use the following command:
```bash
npm test
```

## Example Scripts
Include sample shell scripts in the `/src/scripts` directory.
