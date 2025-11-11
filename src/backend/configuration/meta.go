package configuration

import (
	"fmt"
	"reflect"
	"strings"
	"sync"
)

type MetaNode struct {
	Name         string
	AbsolutePath []string

	Value    any
	Children []MetaNode

	Env          string
	Description  string
	EnvDefault   string
	EnvSeparator string
}

func (n MetaNode) Walk(f func(node MetaNode) error) error {
	if err := f(n); err != nil {
		return err
	}
	for _, child := range n.Children {
		if err := child.Walk(f); err != nil {
			return err
		}
	}
	return nil
}

var (
	loadedMetaNode MetaNode
	metaNodeLoaded bool
	metaNodeMutex  sync.Mutex
)

func createMetaNode(parent []string, name string, value any) MetaNode {
	absolutePath := append([]string{}, parent...)
	if name != "" {
		absolutePath = append(absolutePath, name)
	}

	node := MetaNode{
		Name:         name,
		AbsolutePath: absolutePath,
		Value:        value,
	}

	val := reflect.ValueOf(value)
	if !val.IsValid() {
		return node
	}

	typ := val.Type()
	for typ.Kind() == reflect.Ptr {
		if val.IsNil() {
			return node
		}
		val = val.Elem()
		typ = val.Type()
		node.Value = val.Interface()
	}

	if typ.Kind() != reflect.Struct {
		return node
	}

	childCount := val.NumField()
	if childCount == 0 {
		return node
	}

	node.Children = make([]MetaNode, 0, childCount)
	for i := 0; i < childCount; i++ {
		fieldType := typ.Field(i)
		if fieldType.PkgPath != "" {
			continue // skip unexported fields
		}

		jsonName := fieldType.Tag.Get("json")
		if jsonName == "-" {
			continue
		}

		fieldName := fieldType.Name
		if jsonName != "" {
			parts := strings.Split(jsonName, ",")
			if len(parts) > 0 && parts[0] != "" {
				fieldName = parts[0]
			}
		}

		childNode := createMetaNode(absolutePath, fieldName, val.Field(i).Interface())
		childNode.Env = fieldType.Tag.Get("env")
		childNode.Description = fieldType.Tag.Get("env-description")
		childNode.EnvDefault = fieldType.Tag.Get("env-default")
		childNode.EnvSeparator = fieldType.Tag.Get("env-separator")

		node.Children = append(node.Children, childNode)
	}

	return node
}

func Meta() (MetaNode, error) {
	metaNodeMutex.Lock()
	defer metaNodeMutex.Unlock()
	if metaNodeLoaded {
		return loadedMetaNode, nil
	}

	config, err := Get()
	if err != nil {
		return MetaNode{}, fmt.Errorf("failed to load app config for meta: %w", err)
	}

	loadedMetaNode = createMetaNode([]string{}, "", config)
	metaNodeLoaded = true

	return loadedMetaNode, nil
}

func WalkMeta(f func(node MetaNode) error) error {
	meta, err := Meta()
	if err != nil {
		return fmt.Errorf("failed to load meta for walking: %w", err)
	}

	err = meta.Walk(f)
	if err != nil {
		return fmt.Errorf("failed to walk meta: %w", err)
	}

	return nil
}

func EnvironmentMap() (map[string]MetaNode, error) {
	envMap := make(map[string]MetaNode)
	err := WalkMeta(func(node MetaNode) error {
		if node.Env != "" {
			envMap[node.Env] = node
		}
		return nil
	})
	if err != nil {
		return nil, err
	}

	return envMap, nil
}

func HTMLMap() (map[string]string, error) {
	environmentMap, err := EnvironmentMap()
	if err != nil {
		return nil, fmt.Errorf("failed to load environment map for HTML map: %w", err)
	}

	var sb strings.Builder

	htmlMap := make(map[string]string)
	for envVar, node := range environmentMap {

		sb.WriteByte('%')

		if strings.HasPrefix(envVar, "APP_") {
			sb.WriteString("APP_CONFIG_")
			sb.WriteString(envVar[4:])
		} else {
			sb.WriteString(envVar)
		}

		sb.WriteByte('%')

		var valueStr string
		if node.Value != nil {
			valueStr = fmt.Sprintf("%v", node.Value)
		}
		htmlMap[sb.String()] = valueStr

		sb.Reset()
	}

	return htmlMap, nil
}
