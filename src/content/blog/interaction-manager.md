---
id: 02
title: "Interaction Run after Animation"
excerpt: "InteractionManager is a utility within React Native that allows long-running work to be scheduled after any interactions/animations have completed. This is particularly useful for ensuring smooth animations and interactions on the screen without being blocked by tasks that can wait."
publishDate: "July 19 2024"
featureImage:
  src: "/post-2.webp"
  alt: Sitting on a full bus
  caption: Waiting for next stop
seo:
  image:
    src: "/post-2.jpg"
---

Animations are a powerful tool in React Native for creating engaging and interactive user interfaces. They can enhance the user experience by providing visual feedback and guiding users through the app. But have you ever encountered a situation where an action you wanted to perform after an animation finished, ended up happening before the animation even completed? This can lead to a disjointed user experience, where the UI updates don't seem to align with the animation. In this blog post, we'll explore how to tackle this challenge and ensure a smooth flow between animations and subsequent interactions in your React Native apps.

## The Problem

Let's imagine we have a button that animates its scale to indicate a loading state. Once the animation finishes, we want to update the button text and potentially enable user interaction again.

Here's where the problem arises:

```javascript
const MyButton = () => {
	const [isLoading, setIsLoading] = useState(false)

	const handleButtonClick = () => {
		setIsLoading(true) // Set loading state

		// Animate button scale
		Animated.spring(animatedScale, {
			toValue: 1.2,
			useNativeDriver: true, // (Optional) improve performance for simple animations
		}).start()

		// This might execute before the animation finishes!
		setIsLoading(false) // Update button text (unintended)
	}

	// ... (render button with animated scale and conditional text based on isLoading)
}
```

In this example, setting `setIsLoading(false)` within the start callback might occur before the animation actually finishes. This results in the button text updating prematurely, potentially before the visual scaling animation completes. This creates a jarring user experience where the UI state seems disconnected from the animation.

## The Solution

To ensure actions are executed only after the animation finishes, we can leverage `InteractionManager.runAfterInteractions()`. This function provided by React Native allows us to schedule a callback that will be executed after the current batch of interactions, including animations, have completed.

Here's how we can modify the previous example to use `InteractionManager`:

```javascript
const MyButton = () => {
	const [isLoading, setIsLoading] = useState(false)

	const handleButtonClick = () => {
		setIsLoading(true) // Set loading state

		// Animate button scale
		Animated.spring(animatedScale, {
			toValue: 1.2,
			useNativeDriver: true, // (Optional) improve performance for simple animations
		}).start()

		// Schedule update for after animation finishes
		InteractionManager.runAfterInteractions(() => {
			setIsLoading(false) // Update button text (correct timing)
		})
	}

	// ... (render button with animated scale and conditional text based on isLoading)
}
```

By wrapping the `setIsLoading(false)` call within `InteractionManager.runAfterInteractions()`, we ensure it's queued to execute only after all current interactions, including the animation, are finished. This guarantees a smooth user experience where the button text updates in sync with the animation completion.

## Potential Issues and Considerations

While `InteractionManager.runAfterInteractions()` is a valuable tool, it's important to consider some potential issues and limitations:

1. Nesting

   - Nesting `InteractionManager.runAfterInteractions()` calls can lead to unexpected behavior. Each nested call adds another layer to the queue, potentially delaying the execution of the inner callback.

2. Long-Running Operations

   - While intended for non-critical tasks, placing long-running operations within `InteractionManager` can still impact responsiveness.

3. useNativeDriver

   - While mentioned earlier, it's worth reiterating the `useNativeDriver` property for Animated components. This can improve animation performance on some platforms, but it bypasses the `InteractionManager` queue. Ensure you understand the trade-offs when using it (refer to React Native documentation for details on `useNativeDriver`).

4. Testing

   - Testing scenarios involving animations and `InteractionManager` might require additional considerations. Mocking libraries or custom test utilities can be helpful to simulate these interactions effectively.

## Conclusion

Animations play a crucial role in creating a delightful and engaging user experience in React Native apps. By understanding how to manage their execution and subsequent actions, you can ensure a smooth flow between visual transitions and UI updates.

`InteractionManager.runAfterInteractions()` provides a powerful tool to schedule code execution after animations finish, guaranteeing a cohesive user experience. Remember to consider potential nesting issues, long-running operations within the callback, and the effect of `useNativeDriver` on animation behavior.

By following these guidelines, you can create animations that truly enhance your React Native applications and leave a lasting positive impression on your users.
