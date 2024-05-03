"alias" @keyword
"break" @keyword
"case" @keyword
"comptime" @keyword
"const" @keyword
"continue" @keyword
"default" @keyword
"defer" @keyword
"discard" @keyword
"do" @keyword
"else" @keyword
"enum" @keyword
"extern" @keyword
"false" @keyword
"for" @keyword
"func" @keyword
"if" @keyword
"import" @keyword
"in" @keyword
"match" @keyword
"must" @keyword
"namespace" @keyword
"operator" @keyword
"pragma" @keyword
"private" @keyword
"return" @keyword
"struct" @keyword
"template" @keyword
"throw" @keyword
"true" @keyword
"try" @keyword
"var" @keyword
"variant" @keyword
"while" @keyword
"yield" @keyword

"::" @punctuation.delimiter
":" @punctuation.delimiter
"." @punctuation.delimiter
"," @punctuation.delimiter
";" @punctuation.delimiter
"->" @punctuation.delimiter

"(" @punctuation.bracket
")" @punctuation.bracket
"[" @punctuation.bracket
"]" @punctuation.bracket
"{" @punctuation.bracket
"}" @punctuation.bracket

"&" @operator
"|" @operator
"^" @operator
"~" @operator
"<<" @operator
">>" @operator
"+" @operator
"-" @operator
"*" @operator
"/" @operator
"%" @operator
"++" @operator
"--" @operator
".." @operator
"=" @operator
":=" @operator
"&=" @operator
"|=" @operator
"^=" @operator
"~=" @operator
"<<=" @operator
">>=" @operator
"+=" @operator
"-=" @operator
"*=" @operator
"/=" @operator
"%=" @operator
"<" @operator
"<=" @operator
">" @operator
">=" @operator
"==" @operator
"!=" @operator
"<=>" @operator
"||" @operator
"&&" @operator
"!" @operator
"as" @operator
"is" @operator

(name_segment "<" @punctuation.bracket ">" @punctuation.bracket)

"true" @constant
"false" @constant

(function_decl (identifier) @function)
(function_decl (operator_name) @function)
(type_decl (identifier) @type)

(import_stmt (identifier) @string)

(type (name (name_segment (identifier) @type)))
(name_segment (operand (name (name_segment (identifier) @type))))
(named_tuple_type (identifier) @property)

(parameter_decl (identifier) @variable.parameter)
(var_decl (identifier) @variable)
(type_decl (compound_stmt (var_decl (identifier) @property)))
(for_stmt (identifier) @variable)

(variant_case_decl (identifier) @constant)
(match_case_decl (operand (name (name_segment (identifier) @constant))))

(bin_literal) @number
(oct_literal) @number
(dec_literal) @number
(hex_literal) @number
(char_literal) @string.quoted.double
(string_literal) @string.quoted.single
(escape_sequence) @escape

(call_expr (operand (name (name_segment (identifier) @function))))

(comment) @comment
