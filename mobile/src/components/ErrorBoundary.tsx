import { Component, type ErrorInfo, type ReactNode } from "react";
import { navigate } from "../shims/router";
import { tStatic } from "../i18n/static";

/**
 * Catches a crash inside one screen so the app shows a friendly message instead of a blank white page.
 * App.tsx keys this by the current path, so moving to another screen clears the error automatically.
 */
export default class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info.componentStack);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div role="alert" className="absolute inset-0 grid place-items-center overflow-y-auto px-6">
        <div className="w-full max-w-sm rounded-3xl border border-line bg-white p-7 text-center shadow-sm">
          <h1 className="m-0 font-display text-[28px] leading-tight font-normal text-navy">{tStatic("That didn’t work")}</h1>
          <p className="mb-6 mt-3 text-[15px] leading-6 text-[#5b6675]">{tStatic("Something broke on our side. Please try again, and if it keeps happening, email support@toppershelf.online.")}</p>
          <div className="flex flex-col gap-3">
            <button type="button" onClick={() => this.setState({ failed: false })} className="min-h-12 cursor-pointer rounded-full border-0 bg-[#3b82f6] px-6 text-base font-bold text-white">
              {tStatic("Try again")}
            </button>
            <button type="button" onClick={() => { this.setState({ failed: false }); navigate("/home"); }} className="min-h-12 cursor-pointer rounded-full border border-line bg-white px-6 text-base font-bold text-navy">
              {tStatic("Go to home")}
            </button>
          </div>
        </div>
      </div>
    );
  }
}
