(compound_stmt) @local.scope
(match_expr) @local.scope
(for_stmt) @local.scope
(function_decl) @local.scope

(function_decl (identifier) @local.definition)
(type_decl (identifier) @local.definition)
(parameter_decl (identifier) @local.definition)
(var_decl (identifier) @local.definition)
(for_stmt (identifier) @local.definition)
(variant_case_decl (identifier) @local.definition)
(match_case_decl (identifier) @local.definition)

(operand (name (name_segment (identifier) @local.reference)))
