# Orchard 2.1.7 Local Environment Setup on Windows - NuGet-based - No Admin Privilege Access

## Sections
1. [Install Prerequisite Software](#1-install-prerequisite-software)
2. [Verify Installed Versions](#2-verify-installed-versions)
3. [Building and Running the Solution](#3-building-and-running-the-solution)

This guide provides step-by-step instructions to set up a local development environment for 
Orchard 2.1.7 on a Windows system using NuGet. Note that while the software can be installed without admin privileges,
certain steps, such as adding System Variables may require admin access.

## Requirements
- [.NET SDK < v8.0](https://dotnet.microsoft.com/en-us/download)
- [NVM (Node Version Manager) for Windows](https://github.com/coreybutler/nvm-windows/releases).
  - Node.js < v16.0 (install via NVM)
  - NPM < v8.0.0 (install via NVM)
    - Note: NPM is a package manager for Node.js, used to install and manage JavaScript packages.
  - PNPM < v8.0.0 (install via Corepack)
    - Note: PNPM is a package manager for Node.js, similar to npm but with a focus on performance and disk space efficiency.

## Tested Environment
The local environment has been tested with the following versions:
- .NET SDK v7.0.301
- NVM 1.2.2
  - Node.js v14.17.0
  - PNPM v7.15.0

## 1. Install Prerequisite Software
- **Ensure there are no existing Node.js or npm installations on your system.**  If you previously installed Node.js (especially in C:\Program Files), 
uninstall it and remove any related paths from your system environment variables to avoid conflicts. his is line one.
  <br><br>
- **Install nvm (Node Version Manager)**:
   - Download and install `nvm-setup.exe` from [nvm-windows releases](https://github.com/coreybutler/nvm-windows/releases).
     - Ensure that the nvm installation path aims at `C:\Users\$User\AppData\Roaming\nvm`
     - Symlink???
    <br><br>
- Install Node.js and npm using NVM:
   - Open a new command prompt (cmd) and navigate to the directory where you installed NVM, `C:\Users\$User\AppData\Roaming\nvm`.
   - Run the following command to install Node.js `< v16.0`:
     ```bash
     nvm install 14.17.0
     ```
   - Use the installed version:
     ```bash
     nvm use 14.17.0
     ```
  - This will also install the corresponding version of npm. 
    - Note: NVM allows you to manage multiple Node.js versions easily.
    - If you need to switch Node.js versions in the future, you can use `nvm use <version>`.
  - If npm is not installed automatically, you can install it by running:
    ```bash
    nvm install-latest-npm
    ```
- **Enable PNPM running the following command**:
    ```bash
    corepack enable && corepack prepare pnpm@7.15.0 --activate
    ```
 
- **Install .NET SDK**:
   - Download and install .NET SDK `< v8.0` from [Microsoft .NET](https://dotnet.microsoft.com/en-us/download).

## 2. Verify Installed Versions
Run the following commands to confirm the correct versions are installed:
```bash
dotnet --version
node -v
pnpm -v
```

## 3. Building and Running the Solution

### Option 1: Build using an VS IDE
- Navigate to the parent directory of the project and build/run it. The application will be hosted on:
  - `https://localhost:44300`
  - `http://localhost:8080`

### Option 2: Build Using CLI
- Navigate to the parent directory of the project. And run the following command:
  ```bash
  dotnet run --project src/Orchard.Web/Orchard.Web.csproj
  ```
- The application will be hosted on:
  - `https://localhost:5000`
  - `http://localhost:5001`

*Note*: PNPM is triggered by Corepack during the build