(compound_stmt) @local.scope
(match_expr) @local.scope

(function_decl (identifier) @local.definition)
(type_decl (identifier) @local.definition)
(parameter_decl (identifier) @local.definition)
(var_decl (identifier) @local.definition)
(variant_case_decl (identifier) @local.definition)
(match_case_decl (identifier) @local.definition)

(identifier) @local.reference
