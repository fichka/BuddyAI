import { createElement, type ReactElement } from "react";

type IntrinsicTag = keyof React.JSX.IntrinsicElements;
type ElementFactory<Tag extends IntrinsicTag> = (props: React.JSX.IntrinsicElements[Tag]) => ReactElement;

function element<Tag extends IntrinsicTag>(tag: Tag): ElementFactory<Tag> {
  return function HtmlElement(props: React.JSX.IntrinsicElements[Tag]) {
    return createElement(tag, props);
  };
}

export const html = {
  a: element("a"),
  article: element("article"),
  aside: element("aside"),
  button: element("button"),
  div: element("div"),
  fieldset: element("fieldset"),
  form: element("form"),
  h1: element("h1"),
  h2: element("h2"),
  h3: element("h3"),
  header: element("header"),
  input: element("input"),
  label: element("label"),
  main: element("main"),
  nav: element("nav"),
  option: element("option"),
  p: element("p"),
  section: element("section"),
  select: element("select"),
  span: element("span"),
  textarea: element("textarea")
};
