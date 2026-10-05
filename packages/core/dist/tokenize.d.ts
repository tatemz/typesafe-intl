import { Decrement, Increment, Join, Trim } from './utils';
export type StringInterpolationToken<Name extends string> = {
    type: 'string-interpolation';
    name: Name;
};
export type NumberInterpolationToken<Name extends string> = {
    type: 'number-interpolation';
    name: Name;
};
export type NumberFormatInterpolationToken<Name extends string, Format extends string> = {
    type: 'number-format-interpolation';
    name: Name;
    format: Format;
};
export type DateInterpolationToken<Name extends string> = {
    type: 'date-interpolation';
    name: Name;
};
export type DateFormatInterpolationToken<Name extends string, Format extends string> = {
    type: 'date-format-interpolation';
    name: Name;
    format: Format;
};
export type TimeInterpolationToken<Name extends string> = {
    type: 'time-interpolation';
    name: Name;
};
export type TimeFormatInterpolationToken<Name extends string, Format extends string> = {
    type: 'time-format-interpolation';
    name: Name;
    format: Format;
};
export type SelectInterpolationToken<Name extends string, Options extends string> = {
    type: 'select-interpolation';
    name: Name;
    options: Options;
};
export type PluralInterpolationToken<Name extends string, Options extends string> = {
    type: 'plural-interpolation';
    name: Name;
    options: Options;
};
export type SelectOrdinalInterpolationToken<Name extends string, Options extends string> = {
    type: 'select-ordinal-interpolation';
    name: Name;
    options: Options;
};
export type RichTextInterpolationToken<Tag extends string> = {
    type: 'rich-text-interpolation';
    name: Tag;
};
export type Token = StringInterpolationToken<string> | NumberInterpolationToken<string> | NumberFormatInterpolationToken<string, string> | DateInterpolationToken<string> | DateFormatInterpolationToken<string, string> | TimeInterpolationToken<string> | TimeFormatInterpolationToken<string, string> | SelectInterpolationToken<string, string> | PluralInterpolationToken<string, string> | SelectOrdinalInterpolationToken<string, string> | RichTextInterpolationToken<string>;
type States = {
    Start: 'start';
    Escaped: 'escaped';
    InterpolationStart: 'interpolation-start';
    InterpolationType: 'interpolation-type';
    InterpolationFormat: 'interpolation-format';
    SelectOptions: 'select-options';
    PluralOptions: 'plural-options';
    SelectOrdinalOptions: 'select-ordinal-options';
    RichText: 'rich-text';
};
type SplitAt<S extends string, D extends string> = S extends `${infer P}${D}${infer R}` ? [P, D, R] : [S, '', S];
type Earlier<A extends [string, string, string], B extends [string, string, string]> = A[0] extends `${B[0]}${string}` ? B : A;
type NextEvent<S extends string> = Earlier<Earlier<SplitAt<S, '{'>, SplitAt<S, '<'>>, SplitAt<S, "'">>;
type Scan<Tokens extends Token[], Translation extends string> = NextEvent<Translation> extends [
    infer _Before extends string,
    infer Delimiter extends string,
    infer Rest extends string
] ? Delimiter extends '{' ? _Tokenize<Tokens, States['InterpolationStart'], [
], [
], [
], [
], 0, Rest> : Delimiter extends '<' ? _Tokenize<Tokens, States['RichText'], [], [], [], [], 0, Rest> : Delimiter extends "'" ? Rest extends `{${infer EscapedRest}` ? _Tokenize<Tokens, States['Escaped'], [], [], [], [], 0, EscapedRest> : Rest extends `<${infer EscapedRest}` ? _Tokenize<Tokens, States['Escaped'], [], [], [], [], 0, EscapedRest> : Scan<Tokens, Rest> : Tokens : Tokens;
type _BuildOptionsUnion<Union extends string, Options extends string> = Options extends `${infer Head}{${string}}${infer Tail}` ? _BuildOptionsUnion<Union | Trim<Head>, Tail> : Union;
type BuildOptionsUnion<Options extends string> = _BuildOptionsUnion<never, Options>;
type _Tokenize<Tokens extends Token[], State extends States[keyof States], NameBuffer extends string[], TypeBuffer extends string[], FormatBuffer extends string[], OptionsBuffer extends string[], CurlyBracketCounter extends number, Translation extends string> = Translation extends `${infer Head}${infer Tail}` ? State extends States['InterpolationStart'] ? Head extends ',' ? _Tokenize<Tokens, States['InterpolationType'], NameBuffer, TypeBuffer, FormatBuffer, OptionsBuffer, CurlyBracketCounter, Tail> : Head extends '}' ? Scan<[...Tokens, StringInterpolationToken<Join<NameBuffer>>], Tail> : _Tokenize<Tokens, State, [
    ...NameBuffer,
    Head
], TypeBuffer, FormatBuffer, OptionsBuffer, CurlyBracketCounter, Tail> : State extends States['InterpolationType'] ? Head extends ',' ? _Tokenize<Tokens, States['InterpolationFormat'], NameBuffer, TypeBuffer, FormatBuffer, OptionsBuffer, CurlyBracketCounter, Tail> : Head extends '}' ? Trim<Join<TypeBuffer>> extends 'number' ? Scan<[...Tokens, NumberInterpolationToken<Trim<Join<NameBuffer>>>], Tail> : Trim<Join<TypeBuffer>> extends 'date' ? Scan<[...Tokens, DateInterpolationToken<Trim<Join<NameBuffer>>>], Tail> : Trim<Join<TypeBuffer>> extends 'time' ? Scan<[...Tokens, TimeInterpolationToken<Trim<Join<NameBuffer>>>], Tail> : 'unknown interpolation type' : _Tokenize<Tokens, State, NameBuffer, [
    ...TypeBuffer,
    Head
], FormatBuffer, OptionsBuffer, CurlyBracketCounter, Tail> : State extends States['InterpolationFormat'] ? Trim<Join<TypeBuffer>> extends 'number' ? Head extends '}' ? Scan<[
    ...Tokens,
    NumberFormatInterpolationToken<Trim<Join<NameBuffer>>, Trim<Join<FormatBuffer>>>
], Tail> : _Tokenize<Tokens, State, NameBuffer, TypeBuffer, [
    ...FormatBuffer,
    Head
], OptionsBuffer, CurlyBracketCounter, Tail> : Trim<Join<TypeBuffer>> extends 'date' ? Head extends '}' ? Scan<[
    ...Tokens,
    DateFormatInterpolationToken<Trim<Join<NameBuffer>>, Trim<Join<FormatBuffer>>>
], Tail> : _Tokenize<Tokens, State, NameBuffer, TypeBuffer, [
    ...FormatBuffer,
    Head
], OptionsBuffer, CurlyBracketCounter, Tail> : Trim<Join<TypeBuffer>> extends 'time' ? Head extends '}' ? Scan<[
    ...Tokens,
    TimeFormatInterpolationToken<Trim<Join<NameBuffer>>, Trim<Join<FormatBuffer>>>
], Tail> : _Tokenize<Tokens, State, NameBuffer, TypeBuffer, [
    ...FormatBuffer,
    Head
], OptionsBuffer, CurlyBracketCounter, Tail> : Trim<Join<TypeBuffer>> extends 'select' ? _Tokenize<Tokens, States['SelectOptions'], NameBuffer, TypeBuffer, FormatBuffer, OptionsBuffer, CurlyBracketCounter, Tail> : Trim<Join<TypeBuffer>> extends 'plural' ? _Tokenize<Tokens, States['PluralOptions'], NameBuffer, TypeBuffer, FormatBuffer, OptionsBuffer, CurlyBracketCounter, Tail> : Trim<Join<TypeBuffer>> extends 'selectordinal' ? _Tokenize<Tokens, States['SelectOrdinalOptions'], NameBuffer, TypeBuffer, FormatBuffer, OptionsBuffer, CurlyBracketCounter, Tail> : 'unknown type' : State extends States['SelectOptions'] | States['PluralOptions'] | States['SelectOrdinalOptions'] ? Earlier<SplitAt<Translation, '{'>, SplitAt<Translation, '}'>> extends [
    infer Span extends string,
    infer Brace extends string,
    infer AfterBrace extends string
] ? Brace extends '{' ? _Tokenize<Tokens, State, NameBuffer, TypeBuffer, FormatBuffer, [
    ...OptionsBuffer,
    Span,
    '{'
], Increment<CurlyBracketCounter>, AfterBrace> : Brace extends '}' ? CurlyBracketCounter extends 0 ? State extends States['SelectOptions'] ? Scan<[
    ...Tokens,
    SelectInterpolationToken<Trim<Join<NameBuffer>>, BuildOptionsUnion<Trim<Join<[...OptionsBuffer, Span]>>>>
], AfterBrace> : State extends States['PluralOptions'] ? Scan<[
    ...Tokens,
    PluralInterpolationToken<Trim<Join<NameBuffer>>, BuildOptionsUnion<Trim<Join<[...OptionsBuffer, Span]>>>>
], AfterBrace> : State extends States['SelectOrdinalOptions'] ? Scan<[
    ...Tokens,
    SelectOrdinalInterpolationToken<Trim<Join<NameBuffer>>, BuildOptionsUnion<Trim<Join<[...OptionsBuffer, Span]>>>>
], AfterBrace> : 'unknown state' : _Tokenize<Tokens, State, NameBuffer, TypeBuffer, FormatBuffer, [
    ...OptionsBuffer,
    Span,
    '}'
], Decrement<CurlyBracketCounter>, AfterBrace> : Tokens : Tokens : State extends States['Escaped'] ? Translation extends `${string}}'${infer Rest}` ? Scan<Tokens, Rest> : Translation extends `${string}>'${infer Rest}` ? Scan<Tokens, Rest> : Tokens : State extends States['RichText'] ? SplitAt<Translation, '>'> extends [
    infer Tag extends string,
    infer Found extends string,
    infer AfterTag extends string
] ? Found extends '>' ? AfterTag extends `${infer Children}</${Trim<Tag>}>${infer Rest}` ? Scan<[
    ...Tokens,
    RichTextInterpolationToken<Trim<Tag>>,
    ...Scan<[], Children>
], Rest> : 'invalid rich text' : Tokens : Tokens : 'unknown-state' : Tokens;
export type Tokenize<Translation extends string> = string extends Translation ? [] : Scan<[], Translation>;
export {};
