---
id: 03
title: 'How to find your iOS device from command line'
excerpt: "Finding your iOS device from the command line is a useful skill to have. Whether you're a developer or a power user, knowing how to locate your device can be handy in various scenarios. In this blog post, we'll explore different methods to find your iOS device using the command line, from checking connected devices to retrieving detailed information. Let's dive in and uncover the secrets of iOS device discovery!"
publishDate: 'August 11 2024'
featureImage:
  src: '/post-1.webp'
  alt: Computer screen showing code
  caption: Hacking the planet
seo:
  image:
    src: '/post-1.jpg'
---

As an React Native developer, you might find yourself in situations where you need to locate your iOS device. Whether you're debugging an app, or managing multiple devices, knowing how to find your iOS device can be a valuable skill. In this post, I will show you how to find your iOS device from the command line using various methods. Let's dive in!

## Getting a list of devices

To get a list of all connected iOS devices, you can use the following command:

```
xcrun simctl list devices
```

This command uses `xcrun simctl`, a command-line tool that interacts with the iOS simulator and devices. Running this command will display a list of all connected devices, including simulators and physical devices. This can be handy when you have multiple devices connected and need to identify the one you're looking for.

## Identifying the booted device

If you want to identify the booted device, you can filter the list to show only booted devices. With a little command line-fu, you can achieve this using the following command:

```
xcrun simctl list devices | grep -e "(Booted)" -A 1
```

Since we are already familiar with the `xcrun simctl list devices` command, let's break down the second part of the command:

- `grep -e "(Booted)" -A 1`: This part of the command filters the output to show only booted devices and includes one additional line of context. We pipe the list of devices to `grep`, which searches for the string "(Booted)" and displays the matching line along with the next line.

By running this command in your terminal, you can quickly identify your booted iOS device and retrieve essential information such as the device's name, UDID, and runtime.

## Where are my devices located on disk?

If you're curious about the location of your iOS simulators on disk, you can find them here:

`~/Library/Developer/CoreSimulator/Devices`

From this directory, you can access the folders corresponding to each device, containing the device's data, logs, and other information. One thing I use this for is finding my devices database files for debugging. Use use a command like `find ~/Library/Developer/CoreSimulator/Devices -name "*.sqlite"` to find all the sqlite files on your devices. Or using one of the commands above to find the UDID of the device you want to look at and then use that to find the sqlite files for that device.

## Conclusion

Being able to find your iOS device from the command line is a valuable skill for React Native developers and iOS power users. Whether you're managing multiple devices or debugging an app, knowing how to locate your device can save you time and streamline your development workflow. So, next time you need to find your iOS device, remember these handy command-line tricks!
