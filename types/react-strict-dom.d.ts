declare module "react-strict-dom" {
  import type {
    AnchorHTMLAttributes,
    ButtonHTMLAttributes,
    FieldsetHTMLAttributes,
    FormHTMLAttributes,
    HTMLAttributes,
    InputHTMLAttributes,
    LabelHTMLAttributes,
    OptionHTMLAttributes,
    ReactNode,
    Ref,
    SelectHTMLAttributes,
    TextareaHTMLAttributes
  } from "react";

  type ElementProps<Props, Element> = Props & {
    children?: ReactNode;
    className?: string;
    ref?: Ref<Element>;
  };

  type HtmlComponent<Props, Element> = (props: ElementProps<Props, Element>) => ReactNode;

  export const html: {
    a: HtmlComponent<AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>;
    article: HtmlComponent<HTMLAttributes<HTMLElement>, HTMLElement>;
    aside: HtmlComponent<HTMLAttributes<HTMLElement>, HTMLElement>;
    button: HtmlComponent<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;
    div: HtmlComponent<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
    fieldset: HtmlComponent<FieldsetHTMLAttributes<HTMLFieldSetElement>, HTMLFieldSetElement>;
    footer: HtmlComponent<HTMLAttributes<HTMLElement>, HTMLElement>;
    form: HtmlComponent<FormHTMLAttributes<HTMLFormElement>, HTMLFormElement>;
    h1: HtmlComponent<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
    h2: HtmlComponent<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
    h3: HtmlComponent<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
    h4: HtmlComponent<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
    header: HtmlComponent<HTMLAttributes<HTMLElement>, HTMLElement>;
    input: HtmlComponent<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
    label: HtmlComponent<LabelHTMLAttributes<HTMLLabelElement>, HTMLLabelElement>;
    main: HtmlComponent<HTMLAttributes<HTMLElement>, HTMLElement>;
    nav: HtmlComponent<HTMLAttributes<HTMLElement>, HTMLElement>;
    option: HtmlComponent<OptionHTMLAttributes<HTMLOptionElement>, HTMLOptionElement>;
    p: HtmlComponent<HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>;
    section: HtmlComponent<HTMLAttributes<HTMLElement>, HTMLElement>;
    select: HtmlComponent<SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement>;
    span: HtmlComponent<HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>;
    textarea: HtmlComponent<TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>;
  };

  export const css: {
    create: <Styles extends Record<string, unknown>>(styles: Styles) => Styles;
  };
}
