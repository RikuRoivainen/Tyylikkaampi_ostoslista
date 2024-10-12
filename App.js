import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, FlatList } from 'react-native';
import { TextInput, Button, Card, List, Provider as PaperProvider, IconButton, Appbar } from 'react-native-paper';
import * as SQLite from 'expo-sqlite';
import { useEffect, useState } from 'react';

export default function App() {

  const [product, setProduct] = useState('');
  const [amount, setAmount] = useState('');
  const [items, setItems] = useState([]);

  const db = SQLite.openDatabaseSync('itemsdb');

  const initialize = async () => {
    try {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS item (id INTEGER PRIMARY KEY AUTOINCREMENT, product TEXT, amount TEXT);
        `);
      await updateList();
    } catch (error) {
      console.error('Could not open database', error);
    }
  }

  useEffect(() => { initialize() }, []);

  const addItem = async () => {
    try {
      await db.runAsync('INSERT INTO item VALUES (?, ?, ?)', null, product, amount);
      await updateList();
      console.log(items);
      setProduct(''); 
      setAmount('');
    } catch (error) {
      console.error('Could not add item', error);
    }
  };

  const updateList = async () => {
    try {
      const list = await db.getAllAsync('SELECT * from item');
      setItems(list);
    } catch (error) {
      console.error('Could not get items', error);
    }
  };

  const deleteItem = async (id) => {
    try {
      await db.runAsync('DELETE FROM item WHERE id=?', id);
      await updateList();

    } catch (error) {
      console.error('Could not delete item', error);
    }
  }


  return (
    <PaperProvider>
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.Content title="Shopping list" />
        </Appbar.Header>
        <Card style={styles.card}>
          <Card.Content>
            <TextInput
              mode="outlined"
              label="Product"
              value={product}
              onChangeText={setProduct}
              style={styles.input}
            />
            <TextInput
              mode="outlined"
              label="Amount"
              value={amount}
              onChangeText={setAmount}
              style={styles.input}
            />
            <Button mode="contained" 
              onPress={addItem} 
              style={styles.button}
              icon="content-save">
              Save
            </Button>
          </Card.Content>
        </Card>
        <FlatList
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) =>
            <Card style={styles.itemCard}>
              <Card.Content>
                <List.Item
                  title={item.product}
                  description={`Amount: ${item.amount}`}
                  right={props => (
                    <IconButton
                      icon="delete"
                      iconColor="red"
                      onPress={() => deleteItem(item.id)}
                      />
                  )}
                />
              </Card.Content>
            </Card>}
          data={items}
        />
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  card: {
    marginBottom: 20,
    marginHorizontal: 20, 
  },
  input: {
    marginBottom: 10,
  },
  button: {
    marginTop: 10,
  },
  itemCard: {
    marginBottom: 10,
    marginHorizontal: 20, 
  },
});