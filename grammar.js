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
    $.operand,
    $.prefix_operator,
    $.assignment_operator,
  ],

  word: $ => $.identifier,

  rules: {
    source_file: $ => repeat($.stmt),

    stmt: $ => choice(
      $.import,
      $.pragma,
      $.decl,
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
      $.variant_case_decl,
    ),

    import: $ => seq(
      'import',
      $.identifier,
      repeat(seq('/', $.identifier)),
      optional(';')
    ),

    pragma: $ => seq('pragma', $.identifier, optional(';')),

    compound_stmt: $ => seq('{', repeat($.stmt), '}'),

    if_stmt: $ => prec.left(seq(
      optional(field('comptime', 'comptime')),
      'if', field('cond', $.expr),
      field('then', $.compound_stmt),
      optional(seq(
        'else',
        field('else', choice($.if_stmt, $.if_var_stmt, $.compound_stmt))
      ))
    )),

    if_var_stmt: $ => seq(
      'if', choice('const', 'var'), field('name', $.identifier),
      optional(seq(':', field('type', $.operand))),
      '=', field('initializer', $.expr),
      field('body', $.compound_stmt),
      optional(seq(
        'else',
        field('else', choice($.if_stmt, $.if_var_stmt, $.compound_stmt))
      ))
    ),

    var_else_stmt: $ => prec(1, seq(
      choice('const', 'var'), field('name', $.identifier),
      optional(seq(':', field('type', $.operand))),
      '=', field('initializer', $.expr),
      'else',
      optional(seq(':',
        optional(field('capture_kind', choice('&', '&&'))),
        field('capture', $.identifier)
      )),
      field('body', $.compound_stmt)
    )),

    while_stmt: $ => seq(
      optional(field('comptime', 'comptime')),
      'while',
      field('cond', $.expr),
      field('body', $.compound_stmt)
    ),

    do_while_stmt: $ => seq(
      optional(field('comptime', 'comptime')),
      'do',
      field('body', $.compound_stmt),
      'while',
      field('cond', $.expr),
      optional(';')
    ),

    for_stmt: $ => seq(
      optional(field('comptime', 'comptime')),
      'for',
      optional(field('capture_kind', choice('&', '&&'))),
      field('capture', $.identifier),
      'in',
      field('range', $.expr),
      field('body', $.compound_stmt)
    ),

    break_stmt: $ => seq('break', optional(';')),
    continue_stmt: $ => seq('continue', optional(';')),
    yield_stmt: $ => seq('yield', $.expr, optional(';')),
    return_stmt: $ => prec.right(seq('return', optional($.expr), optional(';'))),
    throw_stmt: $ => seq('throw', $.expr, optional(';')),
    defer_stmt: $ => seq('defer', $.stmt),
    expr_stmt: $ => seq(
      optional(field('comptime', 'comptime')),
      optional(field('discard', 'discard')),
      field('expr', $.expr),
      optional(';')
    ),

    decl: $ => seq(
      optional(field('attributes', $.attributes)),
      optional(field('template_parameters', $.template_parameter_decl)),
      optional(field('private', 'private')),
      choice($.struct_decl, $.enum_decl, $.variant_decl, $.namespace_decl, $.type_alias, $.function_decl, $.var_decl)
    ),

    struct_decl: $ => seq(
      'struct',
      field('name', $.identifier),
      field('body', $.compound_stmt)
    ),

    enum_decl: $ => seq(
      'enum',
      field('name', $.identifier),
      optional(seq(':', field('base_type', $.operand))),
      field('body', $.compound_stmt)
    ),

    variant_decl: $ => seq(
      'variant',
      field('name', $.identifier),
      optional(seq(':', field('base_type', $.operand))),
      field('body', $.compound_stmt)
    ),

    namespace_decl: $ => seq(
      'namespace',
      field('name', $.identifier),
      field('body', $.compound_stmt)
    ),

    type_alias: $ => seq(
      'alias',
      field('name', $.identifier),
      '=',
      field('type', $.operand),
      optional(';')
    ),

    function_decl: $ => seq(
      optional(field('comptime', 'comptime')),
      'func',
      field('name', choice($.identifier, $.operator_name)),
      field('signature', $.function_signature),
      field('body', choice(
        $.default_function_body,
        $.extern_function_body,
        $.compound_stmt
      ))
    ),

    var_decl: $ => seq(
      optional(field('comptime', 'comptime')),
      choice('const', 'var'),
      field('name', $.identifier),
      choice(
        seq(':', field('type', $.operand), '=', field('initializer', $.expr)),
        seq(':', field('type', $.operand)),
        seq('=', field('initializer', $.expr))
      ),
      optional(';')
    ),

    default_function_body: $ => seq('=', 'default', optional(';')),
    extern_function_body: $ => seq('=', 'extern', optional(';')),

    function_signature: $ => seq(
      '(',
      optional(seq(
        $.parameter_decl,
        repeat(seq(',', $.parameter_decl))
      )),
      ')',
      '=>',
      field('return_type', $.operand)
    ),

    parameter_decl: $ => seq(
      optional(field('attributes', $.attributes)),
      field('name', $.identifier),
      seq(':', field('type', $.operand)),
      optional(seq('=', field('initializer', $.expr)))
    ),

    variant_case_decl: $ => seq(
      optional(field('default', 'default')),
      'case',
      field('name', $.identifier),
      optional(seq(':', field('type', $.operand))),
      optional(seq('=', field('id', $.expr))),
      optional(';')
    ),

    attributes: $ => seq(
      '@', '[',
      $.attribute,
      repeat(seq(',', $.attribute)),
      ']'
    ),

    attribute: $ => seq(
      field('name', $.identifier),
      optional(seq(':', field('value', $.operand)))
    ),

    template_parameter_decl: $ => seq(
      'template',
      '<',
      $.template_parameter,
      repeat(seq(',', $.template_parameter)),
      '>'
    ),

    template_parameter: $ => seq(
      field('name', $.identifier),
      ':',
      field('concept', $.identifier),
      optional(field('is_variadic', '..')),
      optional(seq('=', field('value', $.operand)))
    ),

    name: $ => prec.right(20, seq(
      choice(
        field('name', $.identifier),
        seq('operator', field('name', $.operator_name))
      ),
      optional(seq('!', '<', $.operand, repeat(seq(',', $.operand)), '>')),
    )),

    expr: $ => choice(
      $.operand,
      $.binary_expr,
      $.inline_if_expr,
    ),

    operand: $ => choice(
      $.name,
      $.literal,

      $.namespace_expr,

      $.member_access_expr,

      $.call_expr,
      $.index_expr,
      $.postfix_expr,
      $.prefix_expr,

      $.named_tuple_expr,
      $.tuple_expr,
      $.array_expr,
      $.dict_expr,
      $.match_expr,

      $.anonymous_function_expr,
      $.function_reference_expr,
      $.function_type
    ),

    namespace_expr: $ => prec.left(20, seq(field('lhs', $.operand), '::', field('rhs', $.operand))),
    member_access_expr: $ => prec.left(19, seq(field('lhs', $.operand), '.', field('rhs', $.operand))),
    call_expr: $ => prec.left(18, seq(field('callee', $.operand), field('parameters', $.tuple_expr))),
    index_expr: $ => prec.left(18, seq(field('object', $.operand), field('parameters', $.array_expr))),

    postfix_expr: $ => prec.left(17, seq(field('operand', $.operand), field('op', choice('++', '--')))),
    prefix_expr: $ => prec.right(16, seq(field('op', $.prefix_operator), field('operand', $.operand))),

    binary_expr: $ => choice(
      prec.left(15, seq(field('lhs', $.expr), field('op', 'is'), field('rhs', $.operand))),
      prec.left(15, seq(field('lhs', $.expr), field('op', 'as'), field('rhs', $.operand))),

      prec.left(14, seq(field('lhs', $.expr), field('op', '??'), field('rhs', $.expr))),

      prec.left(13, seq(field('lhs', $.expr), field('op', '*'), field('rhs', $.expr))),
      prec.left(13, seq(field('lhs', $.expr), field('op', '/'), field('rhs', $.expr))),
      prec.left(13, seq(field('lhs', $.expr), field('op', '%'), field('rhs', $.expr))),

      prec.left(12, seq(field('lhs', $.expr), field('op', '+'), field('rhs', $.expr))),
      prec.left(12, seq(field('lhs', $.expr), field('op', '-'), field('rhs', $.expr))),

      prec.left(11, seq(field('lhs', $.expr), field('op', '..'), field('rhs', $.expr))),

      prec.left(10, seq(field('lhs', $.expr), field('op', '<<'), field('rhs', $.expr))),
      prec.left(10, seq(field('lhs', $.expr), field('op', '>>'), field('rhs', $.expr))),

      prec.left(9, seq(field('lhs', $.expr), field('op', '<=>'), field('rhs', $.expr))),

      prec.left(8, seq(field('lhs', $.expr), field('op', '<'), field('rhs', $.expr))),
      prec.left(8, seq(field('lhs', $.expr), field('op', '<='), field('rhs', $.expr))),
      prec.left(8, seq(field('lhs', $.expr), field('op', '>'), field('rhs', $.expr))),
      prec.left(8, seq(field('lhs', $.expr), field('op', '>='), field('rhs', $.expr))),

      prec.left(7, seq(field('lhs', $.expr), field('op', '=='), field('rhs', $.expr))),
      prec.left(7, seq(field('lhs', $.expr), field('op', '!='), field('rhs', $.expr))),

      prec.left(6, seq(field('lhs', $.expr), field('op', '&'), field('rhs', $.expr))),
      prec.left(5, seq(field('lhs', $.expr), field('op', '^'), field('rhs', $.expr))),
      prec.left(4, seq(field('lhs', $.expr), field('op', '|'), field('rhs', $.expr))),

      prec.left(3, seq(field('lhs', $.expr), field('op', '&&'), field('rhs', $.expr))),
      prec.left(2, seq(field('lhs', $.expr), field('op', '||'), field('rhs', $.expr))),

      prec.right(0, seq(field('lhs', $.expr), field('op', $.assignment_operator), field('rhs', $.expr))),
    ),

    inline_if_expr: $ => prec.right(1, seq(field('cond', $.expr), '?', field('then', $.expr), ':', field('else', $.expr))),

    named_tuple_expr: $ => seq(
      '(',
      $.named_tuple_element,
      repeat(seq(',', $.named_tuple_element)),
      ')'
    ),
    named_tuple_element: $ => seq(
      field('key', $.identifier), ':', field('value', $.expr),
    ),

    tuple_expr: $ => seq('(', optional(seq($.expr, repeat(seq(',', $.expr)))), ')'),
    array_expr: $ => seq('[', optional(seq($.expr, repeat(seq(',', $.expr)))), ']'),

    dict_expr: $ => seq(
      '{',
      $.dict_element,
      repeat(seq(',', $.dict_element)),
      '}'
    ),
    dict_element: $ => seq(
      field('key', $.expr), ':', field('value', $.expr),
    ),

    match_expr: $ => seq(
      'match',
      field('value', $.expr),
      '{',
      repeat($.match_case_decl),
      optional($.match_default_case),
      '}'
    ),

    match_case_decl: $ => seq(
      'case',
      $.operand,
      repeat(seq('|', $.operand)),
      optional(seq(':', optional(choice('&', '&&')), field('capture', $.identifier))),
      '->',
      field('body', $.stmt)
    ),

    match_default_case: $ => seq('default', '->', field('body', $.stmt)),

    anonymous_function_expr: $ => seq('func', field('signature', $.function_signature), field('body', $.compound_stmt)),
    function_reference_expr: $ => seq('func', '&', field('name', $.name), $.tuple_expr),
    function_type: $ => seq(field('parameter_types', $.tuple_expr), '=>', field('return_type', $.operand)),

    identifier: $ => /[a-zA-Z_][0-9a-zA-Z_]*/,
    operator_name: $ => choice(
      '&', '|', '^', '~', '<<', '>>', '+', '-', '*', '/', '%', '++', '--', '..', '??',
      '=', '&=', '|=', '^=', '<<=', '>>=', '+=', '-=', '*=', '/=', '%=', '??=',
      '==', '!=', '<', '<=', '>', '>=', '<=>', '()', '[]', 'as', 'is'
    ),

    prefix_operator: $ => choice('-', '~', '!', '&', '&&', 'try', 'must'),
    assignment_operator: $ => choice('=', ':=', '&=', '|=', '^=', '<<=', '>>=', '+=', '-=', '*=', '/=', '%=', '??='),

    literal: $ => prec.right(32, choice(
        field('value', $.bool_literal),
        seq(field('value', $.number_literal), optional(field('postfix', $.identifier))),
        seq(field('value', $.char_literal), optional(field('postfix', $.identifier))),
        seq(field('value', $.string_literal), optional(field('postfix', $.identifier)))
      )
    ),

    bool_literal: $ => choice('true', 'false'),

    number_literal: $ => choice(
      /0b[01]+/,
      /0o[01234567]+/,
      /\d+(\.\d+)?([eE][+-]?\d+)?/,
      /0x(([0-9a-f]+)|([0-9A-F]+))/
    ),

    char_literal: $ => seq(
      '\'',
      repeat1(choice(
        token.immediate(/[^\\'\n]/),
        $.escape_sequence,
      )),
      '\'',
    ),

    string_literal: $ => seq(
      '\"',
      repeat(choice(
        token.immediate(prec(1, /[^\\"\n]+/)),
        $.escape_sequence,
      )),
      '\"',
    ),

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
