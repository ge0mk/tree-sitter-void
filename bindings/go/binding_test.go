package tree_sitter_void_test

import (
	"testing"

	tree_sitter "github.com/smacker/go-tree-sitter"
	"github.com/ge0mk/tree-sitter-void"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_void.Language())
	if language == nil {
		t.Errorf("Error loading Void grammar")
	}
}
