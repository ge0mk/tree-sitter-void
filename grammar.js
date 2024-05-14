/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: "void",
  extras: $ => [
    /\s/,
    $.comment,
  ],

  inline: $ => [
    $.stmt,
    $.expr,
    $.expr_list,
    $.operand
  ],

  word: $ => $.identifier,

  rules: {
    source_file: $ => repeat($.stmt),

    stmt: $ => choice(
      $.import_stmt,
      $.pragma,
      $.compound_stmt,
      $.if_stmt,
      $.if_var_stmt,
      $.var_else_stmt,
      $.while_stmt,
      $.do_while_stmt,
      $.for_stmt,
      $.break_stmt,
      $.continue_stmt,
      $.yield_stmt,
      $.return_stmt,
      $.throw_stmt,
      $.defer_stmt,
      $.expr_stmt,
      $.var_decl,
      $.function_decl,
      $.type_decl,
      $.type_alias,
      $.variant_case_decl,
    ),

    import_stmt: $ => seq(
      'import',
      $.identifier,
      repeat(seq('/', $.identifier)),
      optional(';')
    ),

    pragma: $ => seq('pragma', $.identifier, optional(';')),

    compound_stmt: $ => seq('{', repeat($.stmt), '}'),

    if_stmt: $ => prec.left(seq(
      optional('comptime'),
      'if', $.expr,
      $.compound_stmt,
      optional(seq(
        'else',
        choice($.if_stmt, $.if_var_stmt, $.compound_stmt)
      ))
    )),

    if_var_stmt: $ => seq(
      'if', choice('const', 'var'), $.identifier,
      optional(seq(':', $.type)),
      '=', $.expr,
      $.compound_stmt
    ),

    var_else_stmt: $ => prec(1, seq(
      choice('const', 'var'), $.identifier,
      optional(seq(':', $.type)),
      '=', $.expr,
      'else',
      optional(seq(':', optional(choice('&', '&&')), $.identifier)),
      $.compound_stmt
    )),

    while_stmt: $ => seq(
      optional('comptime'),
      'while',
      $.expr,
      $.compound_stmt
    ),

    do_while_stmt: $ => seq(
      optional('comptime'),
      'do',
      $.compound_stmt,
      'while',
      $.expr,
      optional(';')
    ),

    for_stmt: $ => seq(
      optional('comptime'),
      'for',
      optional(choice('&', '&&')),
      $.identifier,
      'in',
      $.expr,
      $.compound_stmt
    ),

    break_stmt: $ => seq('break', optional(';')),
    continue_stmt: $ => seq('continue', optional(';')),
    yield_stmt: $ => seq('yield', $.expr, optional(';')),
    return_stmt: $ => prec.left(seq('return', optional($.expr), optional(';'))),
    throw_stmt: $ => seq('throw', $.expr, optional(';')),
    defer_stmt: $ => seq('defer', $.stmt),
    expr_stmt: $ => seq(optional('comptime'), optional('discard'), $.expr, optional(';')),

    var_decl: $ => seq(
      optional($.annotations),
      optional('private'),
      optional('comptime'),
      choice('const', 'var'),
      $.identifier,
      choice(
        seq(':', $.type, '=', $.expr),
        seq(':', $.type),
        seq('=', $.expr)
      ),
      optional(';')
    ),

    function_decl: $ => seq(
      optional($.annotations),
      optional($.template_parameter_decl),
      optional('private'),
      optional('comptime'),
      'func',
      choice($.identifier, $.operator_name),
      $.function_signature,
      $.function_body,
    ),

    function_signature: $ => seq(
      '(',
      optional(seq(
        $.parameter_decl,
        repeat(seq(',', $.parameter_decl))
      )),
      ')',
      '->',
      $.type
    ),

    parameter_decl: $ => seq(
      optional($.annotations),
      $.identifier,
      seq(':', $.type),
      optional(seq('=', $.expr))
    ),

    function_body: $ => choice(
      seq('=', 'default', optional(';')),
      seq('=', 'extern', optional(';')),
      $.compound_stmt
    ),

    type_decl: $ => seq(
      optional($.annotations),
      optional($.template_parameter_decl),
      optional('private'),
      choice('struct', 'enum', 'variant', 'namespace'),
      $.identifier,
      optional(seq(':', $.type)),
      $.compound_stmt
    ),

    type_alias: $ => seq('alias', $.identifier, '=', $.type, optional(';')),

    variant_case_decl: $ => seq(
      'case',
      $.identifier,
      optional(seq(':', $.type)),
      optional(seq('=', $.expr)),
      optional(';')
    ),

    annotations: $ => seq(
      '@', '[',
      $.annotation,
      repeat(seq(',', $.annotation)),
      ']'
    ),

    annotation: $ => seq(
      $.identifier,
      optional(seq(':', choice(
        $.bin_literal,
        $.oct_literal,
        $.dec_literal,
        $.hex_literal,
        $.char_literal,
        $.string_literal,
      )))
    ),

    template_parameter_decl: $ => seq(
      'template',
      '<',
      $.template_parameter,
      repeat(seq(',', $.template_parameter)),
      '>'
    ),

    template_parameter: $ => seq(
      $.identifier,
      ':',
      $.identifier,
      optional(seq('=', $.operand))
    ),

    type: $ => $.operand,

    name: $ => prec.right(20, seq(
      choice(
        $.identifier,
        seq('operator', $.operator_name)
      ),
      optional(seq('!', '<', $.operand, repeat(seq(',', $.operand)), '>')),
    )),

    expr: $ => choice(
      $.operand,
      $.binary_expr,
      $.inline_if_expr,
    ),

    expr_list: $ => seq($.expr, repeat(seq(',', $.expr)), optional(',')),

    operand: $ => choice(
      $.name,
      $.bool_literal,
      $.bin_literal,
      $.oct_literal,
      $.dec_literal,
      $.hex_literal,
      $.char_literal,
      $.string_literal,

      $.namespace_expr,

      $.member_access_expr,

      $.call_expr,
      $.index_expr,
      $.postfix_expr,
      $.prefix_expr,

      $.named_tuple_expr,
      $.unnamed_tuple_expr,
      $.empty_tuple_expr,
      $.array_expr,
      $.dict_expr,
      $.match_expr,

      $.anonymous_function_expr,
      $.function_reference_expr,
      $.function_type
    ),

    namespace_expr: $ => prec.left(20, seq(field('lhs', $.operand), '::', field('rhs', $.operand))),
    member_access_expr: $ => prec.left(19, seq(field('lhs', $.operand), '.', field('rhs', $.operand))),
    call_expr: $ => prec.left(18, seq(field('callee', $.operand), '(', optional($.expr_list), ')')),
    index_expr: $ => prec.left(18, seq(field('object', $.operand), '[', $.expr_list, ']')),

    postfix_expr: $ => prec.left(17, seq($.operand, choice('++', '--'))),
    prefix_expr: $ => prec.right(16, seq($.prefix_operator, $.operand)),

    binary_expr: $ => choice(
      prec.left(15, seq(field('lhs', $.expr), 'is', field('rhs', $.type))),
      prec.left(15, seq(field('lhs', $.expr), 'as', field('rhs', $.type))),

      prec.left(14, seq(field('lhs', $.expr), '??', field('rhs', $.expr))),

      prec.left(13, seq(field('lhs', $.expr), '*', field('rhs', $.expr))),
      prec.left(13, seq(field('lhs', $.expr), '/', field('rhs', $.expr))),
      prec.left(13, seq(field('lhs', $.expr), '%', field('rhs', $.expr))),

      prec.left(12, seq(field('lhs', $.expr), '+', field('rhs', $.expr))),
      prec.left(12, seq(field('lhs', $.expr), '-', field('rhs', $.expr))),

      prec.left(11, seq(field('lhs', $.expr), '..', field('rhs', $.expr))),

      prec.left(10, seq(field('lhs', $.expr), '<<', field('rhs', $.expr))),
      prec.left(10, seq(field('lhs', $.expr), '>>', field('rhs', $.expr))),

      prec.left(9, seq(field('lhs', $.expr), '<=>', field('rhs', $.expr))),

      prec.left(8, seq(field('lhs', $.expr), '<', field('rhs', $.expr))),
      prec.left(8, seq(field('lhs', $.expr), '<=', field('rhs', $.expr))),
      prec.left(8, seq(field('lhs', $.expr), '>', field('rhs', $.expr))),
      prec.left(8, seq(field('lhs', $.expr), '>=', field('rhs', $.expr))),

      prec.left(7, seq(field('lhs', $.expr), '==', field('rhs', $.expr))),
      prec.left(7, seq(field('lhs', $.expr), '!=', field('rhs', $.expr))),

      prec.left(6, seq(field('lhs', $.expr), '&', field('rhs', $.expr))),
      prec.left(5, seq(field('lhs', $.expr), '^', field('rhs', $.expr))),
      prec.left(4, seq(field('lhs', $.expr), '|', field('rhs', $.expr))),

      prec.left(3, seq(field('lhs', $.expr), '&&', field('rhs', $.expr))),
      prec.left(2, seq(field('lhs', $.expr), '||', field('rhs', $.expr))),

      prec.right(0, seq(field('lhs', $.expr), $.assignment_operator, field('rhs', $.expr))),
    ),

    inline_if_expr: $ => prec.right(1, seq(field('cond', $.expr), '?', field('then', $.expr), ':', field('else', $.expr))),

    named_tuple_expr: $ => seq(
      '(',
      $.identifier, ':', $.expr,
      repeat(seq(',', $.identifier, ':', $.expr)),
      ')'
    ),
    unnamed_tuple_expr: $ => seq('(', $.expr_list, ')'),
    empty_tuple_expr: $ => seq('(', ')'),

    array_expr: $ => seq(
      '[',
      $.expr,
      repeat(seq(',', $.expr)),
      ']'
    ),

    dict_expr: $ => seq(
      '{',
      $.expr, ':', $.expr,
      repeat(seq(',', $.expr, ':', $.expr)),
      '}'
    ),

    match_expr: $ => seq('match', $.expr, '{', repeat($.match_case_decl), optional($.match_default_case), '}'),

    match_case_decl: $ => seq(
      'case',
      $.operand,
      repeat(seq('|', $.operand)),
      optional(seq(':', optional(choice('&', '&&')), $.identifier)),
      '->',
      $.stmt
    ),

    match_default_case: $ => seq('default', '->', $.stmt),

    anonymous_function_expr: $ => seq('func', $.function_signature, $.compound_stmt),
    function_reference_expr: $ => seq('func', '&', $.name, '(', optional(seq($.type, repeat(seq(',', $.type)))), ')'),

    function_type: $ => prec(2, seq($.unnamed_tuple_expr, '->', $.type)),

    identifier: $ => /[a-zA-Z_][0-9a-zA-Z_]*/,
    operator_name: $ => choice(
      '&', '|', '^', '~', '<<', '>>', '+', '-', '*', '/', '%', '++', '--', '..',
      '=', '&=', '|=', '^=', '~=', '<<=', '>>=', '+=', '-=', '*=', '/=', '%=',
      '<', '<=', '>', '>=', '==', '!=', '<=>'
    ),

    prefix_operator: $ => choice('-', '~', '!', '&', '&&', 'try', 'must'),
    assignment_operator: $ => choice('=', ':=', '+=', '-=', '*=', '/=', '%=', '&=', '^=', '|=', '<<=', '>>=', '??='),

    bool_literal: $ => choice('true', 'false'),
    bin_literal: $ => prec.right(30, seq(/0b[01]+/, optional($.identifier))),
    oct_literal: $ => prec.right(30, seq(/0o[01234567]+/, optional($.identifier))),
    dec_literal: $ => prec.right(30, seq(/\d+(\.\d+)?([eE][+-]?\d+)?/, optional($.identifier))),
    hex_literal: $ => prec.right(30, seq(/0x(([0-9a-f]+)|([0-9A-F]+))/, optional($.identifier))),

    char_literal: $ => prec.right(30, seq(
      '\'',
      repeat1(choice(
        token.immediate(/[^\n']/),
        $.escape_sequence,
      )),
      '\'',
      optional($.identifier)
    )),

    string_literal: $ => prec.right(30, seq(
      '\"',
      repeat(choice(
        token.immediate(prec(1, /[^\\"\n]+/)),
        $.escape_sequence,
      )),
      '\"',
      optional($.identifier)
    )),

    escape_sequence: $ => token(prec(1, seq(
      '\\',
      choice(
        /[^xuU]/,
        /\d{2,3}/,
        /x[0-9a-fA-F]{2,}/,
        /u[0-9a-fA-F]{4}/,
        /U[0-9a-fA-F]{8}/,
      ),
    ))),

    // http://stackoverflow.com/questions/13014947/regex-to-match-a-c-style-multiline-comment/36328890#36328890
    comment: _ => token(choice(
      seq('//', /(\\+(.|\r?\n)|[^\\\n])*/),
      seq(
        '/*',
        /[^*]*\*+([^/*][^*]*\*+)*/,
        '/',
      ),
    )),
  }
});
