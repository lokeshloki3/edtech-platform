const RAZORPAY_CHECKOUT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';

let loader: Promise<boolean> | null = null;

// Cached so navigating between the cart and a course page does not append a
// second copy of the script to the document.
export function loadRazorpayScript(): Promise<boolean> {
  if (window.Razorpay) {
    return Promise.resolve(true);
  }

  if (loader) {
    return loader;
  }

  loader = new Promise<boolean>((resolve) => {
    const script = document.createElement('script');
    script.src = RAZORPAY_CHECKOUT_SRC;
    script.onload = () => resolve(true);
    script.onerror = () => {
      loader = null;
      resolve(false);
    };
    document.body.appendChild(script);
  });

  return loader;
}
