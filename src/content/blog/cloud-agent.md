---
id: 07
title: "Your Agents Don’t Need Your Laptop to Be On"
excerpt: "My laptop isn't where my coding agents live anymore. They're running somewhere I can reach from anywhere—even my phone. Here's how I set it up."
publishDate: "Sept 27 2026"
---

I wanted a simple way to run coding agents without keeping my computer running all day. The idea is pretty straightforward:

**Computer → SSH → Ubuntu server → Herdr → coding agents**

The Ubuntu server stays online in AWS. I can SSH into it whenever I need to, start or reconnect to my agent sessions, and then close my laptop without killing everything that's running. For this setup, I used **AWS Lightsail** for the server (an easy way to provision your own cloud server), **Ubuntu** as the operating system, and **Herdr** as the terminal multiplexer for managing agent sessions. Here's a step by step way to get this setup.

Keep reading until the end for a BONUS :)

## 1. Start with a Lightsail instance

Create a new Lightsail instance using:

- **Platform:** Linux/Unix
- **Blueprint:** OS Only
- **Operating system:** Ubuntu

For a small number of agents, a 2 GB / 2 vCPU instance is a reasonable starting point and is **$12/mo** as of writing this. If you plan to run several agents simultaneously, you'll want more RAM.

I named mine:

```text
chuck-box
```

The important thing here is that this server is now independent of my laptop. It can stay online 24/7.

## 2. Give it a static IP

Lightsail's regular public IP can change, so I created a **Static IP** and attached it to the instance.

In Lightsail:

1. Go to **Networking**.
2. Choose **Create static IP**.
3. Name it:

```
chuck-box-ip
```

1. Attach it to your `chuck-box` instance.
2. Record the static IP.

Example:

```
13.222.50.189
```

Your **Lightsail instance name does not need to match your hostname**.

## 3. Make SSH painless

First you need to download your SSH key and save it to this directory:

```
~/.ssh/lightsail-box.pem
```

Rather than typing the entire SSH command every time, I configured an SSH alias on my computer:

```text
Host chuck-box
    HostName 8.111.20.169
    User ubuntu
    IdentityFile ~/.ssh/lightsail-box.pem
    ServerAliveInterval 60
    ServerAliveCountMax 3
```

Save:

- `Control + O`
- Enter
- `Control + X`

Then:

```bash
chmod 600 ~/.ssh/config
```

**Host chuck-box** is simply a shortcut you choose, but with this in place connecting to the server is simply:

```bash
ssh chuck-box
```

That's a small change, but it makes the server feel much more like another machine on my network.

## 4. Set up the development environment

Once connected, I installed the basic tools I'd expect on a development machine.

First let's update the box:

```bash
sudo apt update
sudo apt upgrade -y
sudo reboot
```

Now, let's install Git and GitHub CLI:

```bash
sudo apt install -y git curl wget unzip build-essential ca-certificates jq tree
```

Configure Git:

```bash
git config --global user.name "YOUR NAME"
```

```bash
git config --global user.email "YOUR_GITHUB_EMAIL"
```

Install GitHub CLI:

```bash
type -p curl >/dev/null || sudo apt install curl -y
```

```bash
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | \
sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
```

```bash
sudo chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg
```

```bash
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | \
sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
```

```bash
sudo apt update
```

```bash
sudo apt install gh -y
```

Run:

```bash
gh auth login
```

Choose: **GitHub.com**

Then: **HTTPS**

When asked whether to authenticate Git with your GitHub credentials: **Yes**

Choose: **Login with a web browser**

Follow the displayed instructions.

Verify:

```bash
gh auth status
```

You should see that you are logged into GitHub.

Now you should create a new folder and clone your project into:

```text
mkdir -p ~/projects
cd ~/projects
git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
```

At this point, you can install Node or any other tools you might need but the Lightsail instance is now essentially a remote development machine.

## 5. Add Terminal Multiplexer

Now for the cool part. Installing the terminal multiplexer. This is an important piece to the puzzle. Why? Because a multiplexer keeps running in the background even if you close your window, lose your internet connection, or log off a remote server. You can later "reattach" to the session and pick up right where you left off. For my workflow I chose [Herdr](https://herdr.dev/). Another popular choice is [tmux](https://tmux.app/). Also, keep an eye on [superlogical](https://www.superlogical.com/).

I installed it with:

```bash
curl -fsSL https://herdr.dev/install.sh | sh
```

Then reload your shell:

```bash
source ~/.bashrc
```

Test (you may need to reboot):

```bash
herdr --version
```

Then I installed the integration for whichever coding agent I wanted to use.

For Codex:

```bash
herdr integration install codex
```

Or for Claude:

```bash
herdr integration install claude
```

## 6. Start the workspace

From my repository:

```bash
cd ~/projects/YOUR_REPOSITORY
```

I start Herdr:

```bash
herdr
```

Then I start my coding agent inside the Herdr workspace.

For Codex:

```bash
codex
```

Or for Claude:

```bash
claude
```

Now the agent is running **on the AWS server**, not on my machine 🎉

## The workflow

The result is a pretty simple setup:

```text
                     AWS Lightsail
                  ┌─────────────────┐
                  │     Ubuntu      │
                  │                 │
Computer ── SSH ─►│     Herdr       │
                  │       │         │
                  │       ├─ Codex  │
                  │       ├─ Claude │
                  │       └─ Agent  │
                  │                 │
                  └─────────────────┘
```

I can SSH into the box, start my agents, and then disconnect.

My computer doesn't need to stay awake.

The server doesn't care if I close my laptop.

And when I come back later, I can SSH back into the machine and continue working with the processes that are running there.

## Why I like this setup

The biggest benefit isn't really AWS or SSH. It's **separating the agent environment from my personal computer**.

- My laptop becomes a client.

- The cloud server becomes the persistent workspace.

- The agent is isolated to cloud server.

That means I can let agents work on longer-running tasks without worrying about putting my laptop to sleep, closing my terminal, or taking my machine somewhere else.

It's a relatively inexpensive way to turn a basic cloud VM into an **always-on home for coding agents**.

---

# Bonus: Access Your Agents From Your Phone

Once your agents are running on a remote server, there's no reason you have to access them exclusively from your computer.

You can use an SSH client on your phone or tablet, such as **Termius** or **Moshi**, to connect directly to the same Ubuntu box.

The basic idea is:

```text
Computer ────────┐
                 │
Phone ───────────┼──► SSH ──► AWS Lightsail ──► Herdr ──► Agents
                 │
Tablet ──────────┘
```

Configure the app with your server's:

- Host/IP address
- Username: `ubuntu`
- SSH private key

The hardest part here is getting the key onto your device. **Not recommended** but I sent the key to myself over my messaging app and then saved it to my device.

Then you can open a terminal from your phone and connect to the box.

The really useful part is that your agents **aren't running on your phone**. They're still running on the Lightsail server. Your phone is simply another way to access them. So if you're away from your computer and want to check on an agent, give it another instruction, or inspect what it's doing, you can SSH into the server from your phone.

That's where the whole setup starts to feel a little different from traditional development: **the computer you're holding doesn't have to be the computer doing the work.**
