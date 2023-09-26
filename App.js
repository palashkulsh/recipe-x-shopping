import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Button,
  ScrollView,
} from 'react-native';
import Modal from 'react-native-modal';
import * as Clipboard from 'expo-clipboard';
import Autocomplete from 'react-native-autocomplete-input';
import { createAppContainer } from 'react-navigation';
import { createMaterialTopTabNavigator } from 'react-navigation-tabs';
import { createStackNavigator } from 'react-navigation-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Recipe Screen
const RecipeScreen = ({ navigation }) => {
  const [data, setData] = useState([]);
  const [newRecipeText, setNewRecipeText] = useState('');

  useEffect(() => {
    // Load data from AsyncStorage on component mount
    loadData();
  }, []);

  useEffect(() => {
    const saveData = async () => {
      try {
        await AsyncStorage.setItem('recipeData', JSON.stringify(data));
      } catch (error) {
        console.error('Error saving data:', error);
      }
    };
    // save data to AsyncStorage when data is changed
    saveData();
  }, [data]);

  const loadData = async () => {
    try {
      const storedData = await AsyncStorage.getItem('recipeData');
      if (storedData !== null) {
        setData(JSON.parse(storedData));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const addRecipe = () => {
    if (newRecipeText.trim() !== '') {
      console.log(data, newRecipe);
      const newRecipe = { id: Date.now().toString(), text: newRecipeText };
      setData([newRecipe, ...data]);
      setNewRecipeText('');
    }
  };

  const handleRecipePress = (recipe) => {
    navigation.navigate('RecipeDetail', { recipe });
  };

  return (
    <View style={styles.listPageView}>
      <Text style={styles.tabTitle}>Recipe</Text>
      <View style={styles.addItemContainer}>
        <TextInput
          style={styles.addItemInput}
          placeholder="Add a new recipe..."
          value={newRecipeText}
          onChangeText={(text) => setNewRecipeText(text)}
        />
        <TouchableOpacity onPress={addRecipe} style={styles.addItemButton}>
          <Text style={styles.addItemButtonText}>+</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.tabContainer}>
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleRecipePress(item)}
              style={styles.touchableItem}>
              <Text style={styles.itemText}>{item.text}</Text>
            </TouchableOpacity>
          )}
        />
      </ScrollView>
    </View>
  );
};

// Shopping List Screen
const ShoppingListScreen = ({ navigation }) => {
  const [data, setData] = useState([]);
  const [newItemText, setNewItemText] = useState('');

  useEffect(() => {
    // Load data from AsyncStorage on component mount
    loadData();
  }, []);

  //save data everytime data is changed
  useEffect(() => {
    const saveData = async () => {
      try {
        await AsyncStorage.setItem('shoppingListData', JSON.stringify(data));
      } catch (error) {
        console.error('Error saving data:', error);
      }
    };
    saveData();
  }, [data]);

  const loadData = async () => {
    try {
      const storedData = await AsyncStorage.getItem('shoppingListData');
      if (storedData !== null) {
        setData(JSON.parse(storedData));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const addItem = () => {
    if (newItemText.trim() !== '') {
      //adding new item
      console.log('adding shoppinglist ', newItemText);
      const newItem = { id: Date.now().toString(), text: newItemText };
      setData([newItem, ...data]);
      console.log('new data is ', data);
      //saveData(); // Save data after adding a new item
      setNewItemText('');
    }
  };

  const handleItemPress = (item) => {
    navigation.navigate('ShoppingListItemDetail', { shoppingList: item });
  };

  return (
    <View style={styles.listPageView}>
      <Text style={styles.tabTitle}>Shopping List</Text>
      <View style={styles.addItemContainer}>
        <TextInput
          style={styles.addItemInput}
          placeholder="Add an item to the shopping list..."
          value={newItemText}
          onChangeText={(text) => setNewItemText(text)}
        />
        <TouchableOpacity onPress={addItem} style={styles.addItemButton}>
          <Text style={styles.addItemButtonText}>+</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.tabContainer}>
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity
                onPress={() => handleItemPress(item)}
                style={styles.touchableItem}>
                <Text style={styles.itemText}>{item.text}</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </ScrollView>
    </View>
  );
};

// Recipe Detail Screen

const RecipeDetailScreen = ({ navigation }) => {
  const [query, setQuery] = useState('');
  const [recipe, setRecipe] = useState(navigation.getParam('recipe', {}));

  const [quantity, setQuantity] = useState('');
  const [ingredients, setIngredients] = useState([]); // Populate with initial ingredients
  const [filteredIngredients, setFilteredIngredients] = useState([]);
  const [hideSuggestionResults, setHideSuggestionResults] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);

  const toggleDeleteModal = () => {
    console.log('delete button');
    setModalVisible(!isModalVisible);
  };

  useEffect(() => {
    // Load ingredient data from AsyncStorage on component mount
    loadIngredientData();
  }, [recipe]);

  useEffect(() => {
    const findIngredient = (text) => {
      if (text === '' || (text && text.length < 2)) {
        return [];
      }
      // Implement your filtering logic here based on the ingredients data
      // For example, you can use Array.filter() to find matching ingredients
      let found = ingredients.filter((ingredient) =>
        ingredient.text.toLowerCase().includes(text.toLowerCase())
      );
      return found;
    };
    // Filter ingredients based on the query
    let foundIngredients = findIngredient(query);
    setFilteredIngredients(foundIngredients);
  }, [query, ingredients]);

  const handleDelete = async () => {
    console.log('delete');

    //read recipeData from async storage
    //remove current recipe from recipeData
    //save recipe data back to async storage
    //navigate the user back to recipeScreen
    try {
      let allRecipeData = await AsyncStorage.getItem('recipeData');
      let parsedAllRecipeData = JSON.parse(allRecipeData);
      let indexOfCurrentRecipe = -1;
      parsedAllRecipeData &&
        parsedAllRecipeData.forEach((recipeElement, recipeIndex) => {
          if (recipeElement.id == recipe.id) {
            indexOfCurrentRecipe = recipeIndex;
          }
        });
      if (indexOfCurrentRecipe >= 0) {
        parsedAllRecipeData.splice(indexOfCurrentRecipe, 1);
      }
      await AsyncStorage.setItem(
        'recipeData',
        JSON.stringify(parsedAllRecipeData)
      );
      //now remove this recipe from all shoppingList
      navigation.replace('Home', {});
    } catch (error) {
      console.error('Error saving data after delete:', error);
    }
    //we are replacing the complete stack on delete as
    //during normal navigation after delete, the state of recipe page was not getting refreshed
  };

  useEffect(() => {
    navigation.setParams({ toggleDeleteModal });
  }, []);

  const saveRecipe = async () => {
    try {
      let allRecipeData = await AsyncStorage.getItem('recipeData');
      let parsedAllRecipeData = JSON.parse(allRecipeData);
      console.log('saving recipe', recipe);
      parsedAllRecipeData &&
        parsedAllRecipeData.forEach((recipeElement, recipeIndex) => {
          if (recipeElement.id == recipe.id) {
            parsedAllRecipeData[recipeIndex] = { ...recipe };
          }
        });
      await AsyncStorage.setItem(
        'recipeData',
        JSON.stringify(parsedAllRecipeData)
      );
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const loadIngredientData = async () => {
    try {
      const storedData = await AsyncStorage.getItem('recipeData');
      if (storedData !== null) {
        const parsedRecipeData = JSON.parse(storedData);
        let uniqueIngredients = {};
        //extract unique ingredients from all recipes
        parsedRecipeData.forEach((eachRecipe) => {
          if (!eachRecipe.ingredientList) {
            return;
          }
          if (!eachRecipe.ingredientList || !eachRecipe.ingredientList.length) {
            return;
          }
          //extract text of all ingredients from this recipe
          eachRecipe.ingredientList.forEach((eachIngredient) => {
            console.log('eachIngredient', eachIngredient);
            uniqueIngredients[eachIngredient.text] = 1;
          });
        });
        let ingredientList = Object.keys(uniqueIngredients).map((el) => {
          return { text: el };
        });
        console.log('ing list', ingredientList);
        setIngredients(ingredientList);
      }
    } catch (error) {
      console.error('Error loading ingredient data:', error);
    }
  };

  const handleAddIngredient = () => {
    // Ensure both ingredient and quantity are provided
    // quantity is valid number
    if (query && quantity && !isNaN(quantity)) {
      // Create an object to represent the ingredient and quantity
      // also decided to not keep qtyMetric in recipe ingredientList to keep it simple
      //also i think picking units was an overkill
      const newIngredient = {
        text: query.toString().trim().toLowerCase(),
        quantity: quantity,
        id: Date.now().toString(),
      };

      // Update your recipe data or perform any necessary actions
      // Here, we'll add this newIngredient to the ingredients array.
      if (recipe) {
        //if there is at least 1 ingredient
        if (recipe.ingredientList) {
          let ingredientIndex = -1;
          recipe.ingredientList.forEach((ingredientEl, index) => {
            //mark the ingredient index in recipe ingredientList which matches the ingredient being edited
            if (ingredientEl.text == query) {
              ingredientIndex = index;
            }
          });
          // not found in recipe's existing ingredient list
          if (ingredientIndex < 0) {
            recipe.ingredientList.push(newIngredient);
          } else {
            //found in existing index list
            recipe.ingredientList[ingredientIndex].qty = quantity;
          }
        } else {
          //push the new ingredient in the list
          recipe.ingredientList = [newIngredient];
        }
      }
      setRecipe(recipe);
      saveRecipe();
      // Clear the input fields
      setQuery('');
      setQuantity('');
    } else {
      // Handle error when one or both fields are empty
    }
  };

  const handleQuantityChange = (ingredient, newQuantity) => {
    // Update the quantity for a specific ingredient at the given index
    if (isNaN(newQuantity)) {
      return;
    }
    recipe.ingredientList &&
      recipe.ingredientList.forEach((ingredientEl, index) => {
        if (ingredientEl.text == ingredient.text) {
          console.log('qty cjhange', ingredientEl.quantity, newQuantity);
          ingredientEl.quantity = newQuantity;
        }
      });
    setRecipe({ ...recipe });
    saveRecipe();
  };

  const handleDeleteIngredient = (index) => {
    // Remove an ingredient from the list based on its index
    if (recipe.ingredientList) {
      recipe.ingredientList.splice(index, 1);
    }
    setRecipe({ ...recipe });
    saveRecipe();
  };

  const handleServingChange = (newServing) => {
    console.log('serving', newServing);
    if (newServing == 0 || newServing == '' || isNaN(newServing)) {
      return;
    }
    recipe.serving = newServing;
    setRecipe({ ...recipe });
    saveRecipe();
  };
  return (
    <View style={styles.recipeDetailContainer}>
      <Modal isVisible={isModalVisible}>
        <View style={{ backgroundColor: 'white', padding: 30, height: 200 }}>
          <Text>Are you sure you want to delete this item?</Text>
          <View style={styles.deleteItemModalRow}>
            <TouchableOpacity
              style={styles.deleteItemModalRowDelete}
              onPress={handleDelete}>
              <Text>Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteItemModalRowCancel}
              onPress={toggleDeleteModal}>
              <Text>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <View style={styles.RecipeDetailServingRow}>
        <Text style={styles.servingText}> Servings </Text>
        <TextInput
          style={styles.servingInput}
          keyboardType="numeric"
          defaultValue={recipe.serving && recipe.serving.toString()}
          onChangeText={(text) => handleServingChange(text)}
        />
      </View>
      <Text style={styles.tabTitle}>Recipe Detail</Text>
      <SafeAreaView style={styles.safeView}>
        <View style={styles.rowContainer}>
          {/* Autocomplete Component */}
          <Autocomplete
            data={filteredIngredients}
            defaultValue={query}
            hideResults={hideSuggestionResults}
            onChangeText={(text) => {
              setQuery(text);
              setHideSuggestionResults(false);
            }}
            flatListProps={{
              keyboardShouldPersistTaps: 'always',
              keyExtractor: (_, idx) => idx.toString(),
              style: styles.autocompleteDropDownElement,
              renderItem: ({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setQuery(item.text);
                    setHideSuggestionResults(true);
                  }}>
                  <Text style={styles.autocompleteDropDownElement}>
                    {item.text}
                  </Text>
                </TouchableOpacity>
              ),
            }}
            containerStyle={styles.autocompleteContainer}
            listStyle={styles.autocompleteList}
            inputContainerStyle={styles.autocompleteInputContainer}
          />

          {/* Numeric TextBox for Quantity */}
          <TextInput
            placeholder="Qty"
            keyboardType="decimal-pad"
            style={styles.quantityInput}
            value={quantity}
            onChangeText={(text) => setQuantity(text)}
          />

          {/* Add Button */}
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddIngredient}>
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.tableView}>
          <View>
            {recipe.ingredientList &&
              recipe.ingredientList.map((ingredient, index) => (
                <View key={ingredient.id} style={styles.ingredientRow}>
                  <Text style={styles.recipeIngredientName}>
                    {ingredient.text}
                  </Text>
                  <TextInput
                    placeholder="Qty"
                    keyboardType="decimal-pad"
                    style={styles.ingredientQuantity}
                    defaultValue={
                      ingredient.quantity && ingredient.quantity.toString()
                    }
                    onChangeText={(text) =>
                      handleQuantityChange(ingredient, text)
                    }
                  />
                  {ingredients.map((ingredientElement, index) => {
                    //console.log('render', ingredientElement, ingredient);
                    //render qtyMetric if ingredient found in ingredient list
                    if (
                      ingredientElement.text &&
                      ingredient.text &&
                      ingredientElement.text.trim().toLowerCase() ==
                        ingredient.text.trim().toLowerCase()
                    ) {
                      return (
                        <Text style={styles.ingredientQuantityMetric}>
                          {ingredientElement.qtyMetric}
                        </Text>
                      );
                    }
                  })}

                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteIngredient(index)}>
                    <Text style={styles.deleteButtonText}>X</Text>
                  </TouchableOpacity>
                </View>
              ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

RecipeDetailScreen.navigationOptions = ({ navigation }) => {
  const toggleDeleteModal = navigation.getParam('toggleDeleteModal');
  return {
    title: 'Recipe Detail',
    headerRight: () => (
      <View style={{ marginRight: 20 }}>
        <Button onPress={toggleDeleteModal} title="Delete" />
      </View>
    ),
  };
};

// Shopping List Item Detail Screen
const ShoppingListItemDetailScreen = ({ navigation }) => {
  // all recipes present in system
  const [recipes, setRecipes] = useState([]);
  //current shopping list
  const [shoppingList, setShoppingList] = useState(
    navigation.getParam('shoppingList', {})
  );

  //state to hide recipe suggestions in dropdown if a suggestion is clicked
  const [hideSuggestionResults, setHideSuggestionResults] = useState(false);
  //recipe which is currently suggested by auto complete
  const [autoCompleteRecipe, setAutoCompleteRecipe] = useState({});
  //current text of autocomplete query
  const [query, setQuery] = useState('');
  // recipe suggestions which is currently suggested by auto complete
  const [filteredRecipeSuggestions, setFilteredRecipeSuggestions] = useState(
    []
  );
  // serving size of recipe being added to shopping list
  const [reqServingSizeInput, setReqServingSizeInput] = useState('1');

  //create map of recipes on id to be used later
  const recipeMapOnId = {};
  recipes.forEach((recipeElement) => {
    recipeMapOnId[recipeElement.id] = recipeElement;
  });

  //this variable determines if modal is visible or not
  const [isModalVisible, setModalVisible] = useState(false);

  const toggleDeleteModal = () => {
    console.log('delete button');
    setModalVisible(!isModalVisible);
  };

  const handleDelete = async () => {
    console.log('delete');

    //read recipeData from async storage
    //remove current recipe from recipeData
    //save recipe data back to async storage
    //navigate the user back to recipeScreen
    try {
      let allShoppingListData = await AsyncStorage.getItem('shoppingListData');
      let parsedAllShoppingListData = JSON.parse(allShoppingListData);
      let indexOfCurrentShoppingList = -1;
      parsedAllShoppingListData &&
        parsedAllShoppingListData.forEach(
          (shoppingListElement, shoppingListIndex) => {
            if (shoppingListElement.id == shoppingList.id) {
              indexOfCurrentShoppingList = shoppingListIndex;
            }
          }
        );
      if (indexOfCurrentShoppingList >= 0) {
        parsedAllShoppingListData.splice(indexOfCurrentShoppingList, 1);
      }
      await AsyncStorage.setItem(
        'shoppingListData',
        JSON.stringify(parsedAllShoppingListData)
      );
    } catch (error) {
      console.error('Error saving data after delete:', error);
    }
    //we are replacing the complete stack on delete as
    //during normal navigation after delete, the state of recipe page was not getting refreshed
    navigation.replace('Home', { screen: 'Shopping List' });
  };

  //load recipe for dropdown
  const loadRecipeData = async () => {
    try {
      const storedData = await AsyncStorage.getItem('recipeData');
      console.log('recipes', storedData);
      if (storedData !== null) {
        setRecipes(JSON.parse(storedData));
      }
    } catch (error) {
      console.error('Error loading recipe data:', error);
    }
  };

  //load recipedata in state
  useEffect(() => {
    //loading all recipes at the start of page
    loadRecipeData();
    navigation.setParams({ toggleDeleteModal });
  }, []);

  // hook to keep filtered recipes in state
  useEffect(() => {
    if (query == '' || !query || query.length < 2) {
      return;
    }
    let found = recipes.filter((recipeElement) => {
      if (recipeElement.text) {
        return recipeElement.text
          .trim()
          .toLowerCase()
          .includes(query.trim().toLowerCase());
      }
    });
    console.log('found recipe', query, found);
    setFilteredRecipeSuggestions(found);
  }, [query, recipes, setFilteredRecipeSuggestions]);

  //save shoppinglist
  const saveShoppingList = async (shoppingListToBeSaved) => {
    try {
      let allShoppingListData = await AsyncStorage.getItem('shoppingListData');
      let parsedShoppingListData = JSON.parse(allShoppingListData);
      console.log('saving shoppingList', shoppingListToBeSaved);
      parsedShoppingListData &&
        parsedShoppingListData.forEach(
          (shoppingListElement, shoppingListIndex) => {
            if (shoppingListElement.id == shoppingListToBeSaved.id) {
              parsedShoppingListData[shoppingListIndex] = {
                ...shoppingListToBeSaved,
              };
            }
          }
        );
      await AsyncStorage.setItem(
        'shoppingListData',
        JSON.stringify(parsedShoppingListData)
      );
    } catch (error) {
      console.error('Error saving shoppingList data:', error);
    }
  };

  useEffect(() => {
    saveShoppingList(shoppingList);
  }, [shoppingList]);
  //load shoppinglist

  //handle add recipe
  const handleAddRecipeInShoppingList = async () => {
    //add recipe only if its valid
    //input recipe is stored in autoCompleteRecipe
    if (autoCompleteRecipe && autoCompleteRecipe.id) {
      //check if recipe exists in shopping list or not
      let inputRecipePresentInShoppingList = false;
      //if recipeList is yet not created in shopping list then init it
      if (!shoppingList.recipeList) {
        shoppingList.recipeList = [];
      }
      shoppingList.recipeList.forEach((eachShoppingListRecipe) => {
        //already present in shopping list recipes
        if (eachShoppingListRecipe.id == autoCompleteRecipe.id) {
          inputRecipePresentInShoppingList = true;
        }
      });
      //when recipe is not present in shopping list
      if (!inputRecipePresentInShoppingList) {
        //dont add complete recipe data in shopping list
        //this will prevent data inconsistency in recipes in
        //shoppinglist and main recipe
        shoppingList.recipeList.push({
          id: autoCompleteRecipe.id,
          reqServing: reqServingSizeInput,
        });
      }
      //no need to save the shopping list explicitly
      //useEffect handles it
      setShoppingList({ ...shoppingList });
      setQuery('');
      setAutoCompleteRecipe({});
      setReqServingSizeInput('');
    }
  };

  //handle edit recipe servings
  const handleEditRecipeInShoppingList = async () => {};

  const handleDeleteRecipeFromShoppingList = async (index) => {
    if (shoppingList.recipeList && index < shoppingList.recipeList.length) {
      shoppingList.recipeList.splice(index, 1);
      setShoppingList({ ...shoppingList });
    }
  };

  const handleRecipeReqServingChangeForShoppingList = async (
    recipeBeingChangedInShoppingList,
    inputText
  ) => {
    if (isNaN(inputText) || inputText == '') {
      return;
    }
    if (shoppingList && shoppingList.recipeList) {
      shoppingList.recipeList.forEach((recipeEl) => {
        if (recipeBeingChangedInShoppingList.id == recipeEl.id) {
          recipeEl.reqServing = inputText;
        }
      });
    }
    //shopping list changes are automatically saved via useEffect
    setShoppingList({ ...shoppingList });
  };

  generateIngredientForListHanlder = async () => {
    navigation.navigate('IngredientFromShoppingList', {
      shoppingList,
      recipeMapOnId,
    });
  };

  return (
    <SafeAreaView style={styles.safeView}>
      <Button
        onPress={generateIngredientForListHanlder}
        title="Generate ingredient list"
      />
      <Modal isVisible={isModalVisible}>
        <View style={{ backgroundColor: 'white', padding: 30, height: 200 }}>
          <Text>Are you sure you want to delete this item?</Text>
          <View style={styles.deleteItemModalRow}>
            <TouchableOpacity
              style={styles.deleteItemModalRowDelete}
              onPress={handleDelete}>
              <Text>Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteItemModalRowCancel}
              onPress={toggleDeleteModal}>
              <Text>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <View style={styles.rowContainer}>
        {/* Autocomplete Component */}
        <Autocomplete
          data={filteredRecipeSuggestions}
          defaultValue={query}
          hideResults={hideSuggestionResults}
          onChangeText={(text) => {
            setQuery(text);
            //show suggestions if they are hidden and text input changes
            if (hideSuggestionResults) {
              setHideSuggestionResults(false);
            }
          }}
          flatListProps={{
            keyboardShouldPersistTaps: 'always',
            keyExtractor: (_, idx) => idx.toString(),
            style: styles.autocompleteDropDownElement,
            renderItem: ({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  setAutoCompleteRecipe(item);
                  setQuery(item.text);
                  //also setting serving size on selecting a dropdown
                  setReqServingSizeInput(item.serving);
                  setHideSuggestionResults(true);
                }}>
                <Text style={styles.autocompleteDropDownElement}>
                  {item.text}
                </Text>
              </TouchableOpacity>
            ),
          }}
          containerStyle={styles.autocompleteContainer}
          listStyle={styles.autocompleteList}
          inputContainerStyle={styles.autocompleteInputContainer}
        />

        {/* Numeric TextBox for Quantity */}
        <TextInput
          placeholder="Qty"
          keyboardType="decimal-pad"
          style={styles.quantityInput}
          defaultValue={reqServingSizeInput}
          onChangeText={(text) => setReqServingSizeInput(text)}
        />

        {/* Add Button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddRecipeInShoppingList}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>
      <View>
        {/* Ingredient List */}
        <ScrollView sytle={styles.tableView}>
          <View style={{ paddingBottom: 100, paddingTop: 40 }}>
            {shoppingList.recipeList &&
              shoppingList.recipeList.map((recipeElement, index) => (
                <View key={recipeElement.id} style={styles.ingredientRow}>
                  <TouchableOpacity
                    style={styles.recipeIngredientName}
                    onPress={() => {
                      //since recipeElement in shopping list does not have complete recipe info
                      navigation.navigate('RecipeDetail', {
                        recipe: recipeMapOnId[recipeElement.id],
                      });
                    }}>
                    <Text>
                      {recipeMapOnId[recipeElement.id] &&
                        recipeMapOnId[recipeElement.id].text}
                    </Text>
                  </TouchableOpacity>
                  <TextInput
                    placeholder="Qty"
                    key={'serving' + recipeElement.id}
                    keyboardType="decimal-pad"
                    style={styles.ingredientQuantity}
                    defaultValue={
                      recipeElement.reqServing &&
                      recipeElement.reqServing.toString()
                    }
                    onChangeText={(text) =>
                      handleRecipeReqServingChangeForShoppingList(
                        recipeElement,
                        text
                      )
                    }
                  />
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteRecipeFromShoppingList(index)}>
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              ))}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

ShoppingListItemDetailScreen.navigationOptions = ({ navigation }) => {
  const toggleDeleteModal = navigation.getParam('toggleDeleteModal');
  return {
    headerRight: () => (
      <View style={{ marginRight: 20 }}>
        <Button onPress={toggleDeleteModal} title="Delete" />
      </View>
    ),
  };
};

// Ingredients Screen
const IngredientsScreen = ({ navigation }) => {
  const [data, setData] = useState([]);
  const [newIngredientText, setNewIngredientText] = useState('');
  const [selectedQtyMetric, setSelectedQtyMetric] = useState('kg'); // Rename to selectedQtyMetric

  useEffect(() => {
    // Load data from AsyncStorage on component mount
    loadData();
  }, []);

  useEffect(() => {
    // Set "kg" as the default selectedQtyMetric
    setSelectedQtyMetric('kg');
  }, []);

  const loadData = async () => {
    try {
      const storedData = await AsyncStorage.getItem('ingredientData');
      if (storedData !== null) {
        setData(JSON.parse(storedData));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const saveData = async () => {
    try {
      await AsyncStorage.setItem('ingredientData', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const addIngredient = () => {
    if (newIngredientText.trim() !== '') {
      const newIngredient = {
        id: Date.now().toString(),
        text: newIngredientText,
        qtyMetric: selectedQtyMetric, // Include qtyMetric when adding an ingredient
      };
      setData([...data, newIngredient]);
      setNewIngredientText('');
      saveData(); // Save data after adding a new ingredient, including qtyMetric
    }
  };

  const handleIngredientPress = (ingredient) => {
    navigation.navigate('IngredientDetail', { ingredient });
  };

  return (
    <View style={styles.tabContainer}>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleIngredientPress(item)}
            style={styles.touchableItem}>
            <Text style={styles.itemText}>{item.text}</Text>
            <Text style={styles.itemOptionText}>{item.qtyMetric}</Text>
          </TouchableOpacity>
        )}
      />

      <View style={styles.bottomRow}>
        <TextInput
          style={styles.addIngredientItemInput}
          placeholder="Add a new ingredient..."
          value={newIngredientText}
          onChangeText={(text) => setNewIngredientText(text)}
        />

        <View style={styles.radioButtons}>
          <TouchableOpacity
            onPress={() => setSelectedQtyMetric('kg')}
            style={[
              styles.radioButton,
              selectedQtyMetric === 'kg' && styles.radioButtonSelected,
            ]}>
            <Text
              style={[
                styles.radioButtonText,
                selectedQtyMetric === 'kg' && styles.radioButtonTextSelected,
              ]}>
              kg
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSelectedQtyMetric('unit')}
            style={[
              styles.radioButton,
              selectedQtyMetric === 'unit' && styles.radioButtonSelected,
            ]}>
            <Text
              style={[
                styles.radioButtonText,
                selectedQtyMetric === 'unit' && styles.radioButtonTextSelected,
              ]}>
              unit
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={addIngredient} style={styles.addItemButton}>
          <Text style={styles.addItemButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Ingredient Detail Screen
const IngredientDetailScreen = ({ navigation }) => {
  const ingredient = navigation.getParam('ingredient', {});

  return (
    <View style={styles.itemDetailContainer}>
      <Text style={styles.itemDetailText}>{ingredient.text}</Text>
    </View>
  );
};

const IngredientFromShoppingListScreen = ({ navigation }) => {
  const [shoppingList, setShoppingList] = useState(
    navigation.getParam('shoppingList', {})
  );
  const [recipeMapOnId, setRecipeMapOnId] = useState(
    navigation.getParam('recipeMapOnId', {})
  );
  let ingredientWiseMap = {};

  console.log('IngredientFromShoppingListScreen', shoppingList);
  console.log('recipeMapOnId', recipeMapOnId);
  if (!shoppingList || !recipeMapOnId || !shoppingList.recipeList) {
    console.log('insize');
    return (
      <View>
        <Text style={styles.tabTitle}>no Ingredient</Text>
      </View>
    );
  }

  const calculateIngredients = (shoppingList, recipeMapOnId) => {
    let ingredientWiseMap = {};
    //take all recipes in given shopping list
    shoppingList.recipeList.forEach((eachRecipeFromShoppingList) => {
      console.log('inside shoppingList.recipeList');
      //recipe object in shopping list hsa very limited info
      //so find this recipe in complete recipe map and then use that info for any calculation
      const eachRecipe = recipeMapOnId[eachRecipeFromShoppingList.id];

      //recipe would not exist if it has been deleted
      if (!eachRecipe) {
        return;
      }
      //how many servings are needed for this recipe in shopping List
      const recipeServingNeededInShoppingList =
        eachRecipeFromShoppingList.reqServing;

      //find how many servings are needed in shopping list for this recipe
      const recipeServingsRequired = isNaN(recipeServingNeededInShoppingList)
        ? 1
        : Number(recipeServingNeededInShoppingList);
      // find how many servings does recipe has by default
      const defaultRecipeServingSize = isNaN(eachRecipe.serving)
        ? 1
        : Number(eachRecipe.serving);
      //servings req in shopping list / default serving size of recipe
      const ratioInWhichIngredientsAreRequired =
        recipeServingsRequired / defaultRecipeServingSize;
      console.log('shoppingList.recipeList', eachRecipe);
      if (eachRecipe.ingredientList) {
        //take all ingredient in each shopping list
        eachRecipe.ingredientList.forEach((eachIngredient) => {
          console.log('inside eachRecipe.ingredientList', eachIngredient);
          if (eachIngredient.text) {
            //initiate ingredient map if not already present for that ingredient
            if (!ingredientWiseMap[eachIngredient.text]) {
              ingredientWiseMap[eachIngredient.text] = {
                totalQty: 0,
                recipeWiseInfo: {},
              };
            }

            //ingredient req for this recipe
            const ingredientReqForThisRecipe =
              ratioInWhichIngredientsAreRequired *
              Number(eachIngredient.quantity);

            if (!isNaN(ingredientReqForThisRecipe)) {
              ingredientWiseMap[eachIngredient.text].totalQty += Number(
                ingredientReqForThisRecipe
              );
            }
            ingredientWiseMap[eachIngredient.text].recipeWiseInfo[
              eachRecipe.id
            ] = {
              recipeServingsRequired,
              defaultRecipeServingSize,
              ratioInWhichIngredientsAreRequired,
              ingredientReqForThisRecipe,
              ...eachRecipe,
            };
            console.log('adding to ingredient', ingredientWiseMap);
          }
        });
      }
    });
    return ingredientWiseMap;
  };

  ingredientWiseMap = calculateIngredients(shoppingList, recipeMapOnId);
  console.log('ingredientWiseMap', ingredientWiseMap);

  const copyTableToClipboard = () => {
    let contentString = Object.keys(ingredientWiseMap)
      .map(
        (eachIngredientText) =>
          `${eachIngredientText} - ${ingredientWiseMap[
            eachIngredientText
          ].totalQty.toFixed(2)}`
      )
      .join('\n');
    Clipboard.setString(contentString);
  };
  return (
    <View>
      <View style={styles.container}>
        <Button title="Copy Table" onPress={copyTableToClipboard} />
        <ScrollView>
          <View style={{ paddingBottom: 100, paddingTop: 30 }}>
            {Object.keys(ingredientWiseMap).map((ingredientName) => {
              return (
                <View style={styles.row} key={ingredientName}>
                  <Text style={styles.rowContent}>{ingredientName}</Text>
                  <Text style={styles.rowContent}>
                    {ingredientWiseMap[ingredientName].totalQty.toFixed(2)}
                  </Text>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const TabNavigator = createMaterialTopTabNavigator(
  {
    Recipe: RecipeScreen,
    'Shopping List': ShoppingListScreen,
    //Ingredients: IngredientsScreen,
  },
  {
    tabBarOptions: {
      style: {
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#ccc',
        elevation: 0,
        marginBottom: 10,
      },
      tabStyle: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
      },
      labelStyle: {
        fontSize: 15,
        color: '#009688',
      },
      indicatorStyle: {
        backgroundColor: '#009688',
      },
      scrollEnabled: true,
    },
  }
);

const AppNavigator = createStackNavigator(
  {
    Home: {
      screen: TabNavigator,
      navigationOptions: ({ navigation }) => ({
        headerTitle: 'Recipe X Shopping',
        headerTitleStyle: {
          fontSize: 24,
          color: '#009688',
        },
      }),
    },
    RecipeDetail: {
      screen: RecipeDetailScreen,
      navigationOptions: ({ navigation }) => ({
        title: navigation.getParam('recipe', {}).text, // Set the title to the item name
      }),
    },
    ShoppingListItemDetail: {
      screen: ShoppingListItemDetailScreen,
      navigationOptions: ({ navigation }) => ({
        title: navigation.getParam('shoppingList', {}).text, // Set the title to the item name
      }),
    },
    IngredientDetail: IngredientDetailScreen,
    IngredientFromShoppingList: IngredientFromShoppingListScreen,
  },
  {
    initialRouteName: 'Home',
  }
);

const AppContainer = createAppContainer(AppNavigator);

const styles = StyleSheet.create({
  listPageView: {
    paddingBottom: 50,
    paddingLeft: 5,
  },
  tabContainer: {
    alignItems: 'flex-start',
    margin: 20,
    padding: 10,
    paddingBottom: 30,
  },
  tabTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  touchableItem: {
    backgroundColor: '#f2f2f2',
    padding: 5,
    marginVertical: 2,
    borderRadius: 5,
    alignSelf: 'flex-start',
  },
  itemText: {
    fontSize: 16,
  },
  addItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingLeft: 40,
    paddingRight: 40,
  },
  addItemInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingLeft: 10,
    height: 40,
    flex: 1,
    marginRight: 10,
  },
  addIngredientItemInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingLeft: 10,
    height: 40,
    flex: 3,
    marginRight: 10,
  },
  addItemButton: {
    backgroundColor: '#009688',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
    width: 40,
  },
  addItemButtonText: {
    color: '#fff',
    fontSize: 24,
  },
  searchInput: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 20,
    paddingLeft: 10,
    height: 40,
    marginRight: 10,
  },
  itemDetailContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemDetailText: {
    fontSize: 24,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20, // Add margin to separate it from the flat list
  },
  radioButtons: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    flex: 2,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10, // Add margin between radio buttons
    margin: 10,
    padding: 10,
  },
  radioButtonSelected: {
    backgroundColor: '#009688', // Change background color for selected option
  },
  radioButtonText: {
    marginLeft: 5,
  },
  radioButtonTextSelected: {
    color: 'white', // Change text color for selected option
  },
  // Styles for Autocomplete
  autocompleteContainer: {
    flex: 4,
    zIndex: 10,
    margin: 5,
  },
  autocompleteList: {
    padding: 20,
    borderColor: '#ccc',
    borderWidth: 10,
    backgroundColor: 'white',
    zIndex: 10, // Ensure the list is above other elements
  },
  autocompleteDropDownElement: {
    fontSize: 50,
  },
  autocompleteInputContainer: {
    borderWidth: 0, // Remove the border from the input field
  },
  recipeDetailContainer: {
    flex: 1,
    padding: 20,
    zIndex: -1,
  },
  tabTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  safeView: {
    flex: 1,
  },
  rowContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  autocompleteInput: {
    flex: 4,
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    marginRight: 10,
  },
  quantityInput: {
    flex: 1,
    maxHeight: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    marginRight: 10,
  },
  addButton: {
    flex: 1,
    maxHeight: 50,
    backgroundColor: 'green',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 20,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  ingredientQuantity: {
    width: 60,
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    marginRight: 10,
    flex: 1,
  },
  ingredientQuantityMetric: {
    flex: 2,
    margin: 4,
    minWidth: 36,
    width: '100%',
  },
  deleteButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    alignItems: 'center',
  },
  deleteButtonText: {
    fontWeight: 700,
    alignContent: 'center',
    color: 'white',
  },
  recipeIngredientName: {
    flex: 4,
    padding: 5,
  },
  RecipeDetailServingRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  servingInput: {
    backgroundColor: 'white',
    minWidth: 50,
    padding: 4,
  },
  servingText: {
    fontSize: 17,
    marginRight: 20,
  },
  ShoppingListItemDetailScreen: {
    margin: 4,
  },
  container: {
    flexDirection: 'column',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginBottom: 5,
  },
  rowContent: {
    flex: 1,
    textAlign: 'center',
  },
  tableView: {
    flexDirection: 'column',
    padding: 8,
  },
  deleteItemModalRow: {
    flexDirection: 'row',
    padding: 5,
    alignItems: 'center',
  },
  deleteItemModalRowDelete: {
    backgroundColor: 'red',
    height: 40,
    width: 90,
    margin: 20,
    padding: 10,
    alignContent: 'center',
  },
  deleteItemModalRowCancel: {
    backgroundColor: 'grey',
    height: 40,
    width: 90,
    margin: 20,
    padding: 10,
    alignContent: 'center',
  },
});

export default function App() {
  return <AppContainer />;
}
