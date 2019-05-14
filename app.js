// BUDGET CONTROLLER
var budgetController = (function() {
    // A function constructor to form multiple objects for Expenses
    var Expense = function(id, description, value) {
        this.id = id,
        this.description = description,
        this.value = value,
        this.percentage = -1
    };

    Expense.prototype.calcPercentage = function(totalIncome) {
        if(totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else if(totalIncome = 0) {
            this.percentage = -1;
        }
        
    };

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    };

    // A function constructor to form multiple objects for Incomes
    var Income = function(id, description, value) {
        this.id = id,
        this.description = description,
        this.value = value
    };

    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(cur) {
            sum += cur.value;
        });
        data.totals[type] = sum;
    };

    var data = {
        allItems: {
            inc: [],
            exp: []
        },
        totals: {
            inc: 0,
            exp: 0
        },
        budget: 0,
        percentage: -1
    }

    return {
        addItem: function(type, des, val) {
            var newItem, ID;
            
            // [1,2,3,4,5], next ID = 6
            // [1,2,4,6,8], next ID = 9
            // ID = last ID + 1

            // Create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            

            // Create new Item based on 'inc' or 'exp' type
            if(type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if(type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            // Pushing it into our data structure
            data.allItems[type].push(newItem);

            // Returning the new item
            return newItem;
        },

        deleteItem: function(type, id) {
            var ids, index;
            //.map calls a function for each element of the array one by one AND RETURNS A NEW ARRAY and not change the original array
            ids = data.allItems[type].map(function(current) {
                return current.id;
            });

            index = ids.indexOf(id);

            // Delete the element of the array if the index of the id is NOT -1
            if(index !== -1) {
                data.allItems[type].splice(index, 1);   // .splice(start, end) deletes elements from the given starting index and the given ending index
            }
        },

        calculateBudget: function() {

            // Calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');


            // Calculate the budget income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            // Calculate the percentage of the income that we spent ONLY IF there is something in the income data stucture
            if(data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
            
        },


        calculatePercentages: function() {

            data.allItems.exp.forEach(function(cur) {
                cur.calcPercentage(data.totals.inc);
            });
        },


        getPercentages: function() {
            var allPerc = data.allItems.exp.map(function(cur) {
                return cur.getPercentage();
            });
            return allPerc;
        },


        getBudget: function() {
            // To return multiple objects, we return an object
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };

        },

        testing: function() {
            console.log(data);
        }
    };

})();



// UI CONTROLLER
var UIController = (function() {
    // Object that stores all the string values so that changes can be made made in the entire document by changing just one element
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercentageLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    // Private function to format the numbers in the UI
    var formatNumber = function(num, type) {
        var numSplit;
        
        /*+ or - before the number
        exactly two decimal points
        comma separatign the thousands*/

        // .abs() returns the absolute value (only the number without a negative sign)
        num = Math.abs(num);    // A property of Math function
        //.toFixed rounds to the number of gives decimal points
        num = num.toFixed(2);   // Not a property of Math function RETURNS A STRING

        // To split the string generated by .toFixed into integer and decimal parts
        numSplit = num.split('.');

        int = numSplit[0];
        if(int.length > 3) {
            //.substr(starting point, number of elements) reads only a part of the string
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, int.length);
        }

        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;

    };

    // Custom forEach function
    var nodeListForEach = function(list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };
    
    // Return the UI values so as to make them public
    return {
        getInput: function() {
            return {
                type: document.querySelector(DOMstrings.inputType).value, // Will either be inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            }
        },

        deleteList: function(selectorID) {
            var element = document.getElementById(selectorID)
            // In javascriot we can only remove a child and not specifically an element that is why we need to first find the parent element and then use the delete child DOM function
            element.parentNode.removeChild(element);    // <select the id to be deleted>.parentNode.removeChild(<again select the id of the element to be deleted>);


        },

        clearFields: function() {
            var fields, fieldsArr;

            // Selecting all fields to be cleared
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
            // .querySelectorAll does not select and return all the elements as an array but as a list and that is why we can't use array methods like .slice etc
            // Instead we use the following mehtod to trick the .querySelectorAll method to return the selections are an array so that we can use for loop and one by one clear all the fields!
            // Array --> Is an array constructor
            fieldsArr = Array.prototype.slice.call(fields);

            // Instead of using a for loop we are using .forEach method
            // Syntax -->   ___.forEach(currentValueCurrently being processed, index, array)

            fieldsArr.forEach(function(current, index, array) {
                current.value = "";
            });

            // To set back the focus to the first text field after clearing the fields
            fieldsArr[0].focus(); // We have converted the list to an array using the trick, so 0 --> .inputDescription

        },

        // Function to display the budget in the UI
        displayBudget: function(obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
            document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage;

            // Display something else when percentage is -1
            if(obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
        },

        displayPercentages: function(percentages) {
            
            // querySelectorAll() only returns a node and not an array, so we need to convert it into an array
            var fields = document.querySelectorAll(DOMstrings.expensesPercentageLabel);

            // To convert the above list into an array, we are going to make our own forEach() function!

            nodeListForEach(fields, function(current, index) {

                if(percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
                
            });

        },

        displayMonth: function() {
            var now, year, month, months;

            // Object constructors should be created with the 'new' keyword
            now = new Date();

            months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            month = now.getMonth();

            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
        },

        changeType: function() {

            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue
                );

                // Change the CSS of Fields
                nodeListForEach(fields, function(cur) {
                    // Toggle the CSS ----> Add and Remove at each change
                    cur.classList.toggle('red-focus');
                });

                // Change the CSS of Button
                document.querySelector(DOMstrings.inputBtn).classList.toggle('red');

        },

        getDOMstrings: function() {
            return DOMstrings;
        },
        addListItem: function(obj, type) {
            var html, newHtml, element;
            // Create HTML string with placeholder text
            
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                
                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;
                
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            
            // Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
            
            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },
    };
})();



// GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl) {
    
    var setupEventListeners = function() {
        
        var DOM = UICtrl.getDOMstrings();
        
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem); //ctrlAddItem called implicitly
        
        document.addEventListener('keypress', function(event) {
            if(event.keyCode === 13 || event.which === 12) {
                //Call the Add Item controller
                ctrlAddItem();
            }
        });
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType)
    };
    
    var updateBudget = function() {
        // 1. Calculate the budget
        budgetCtrl.calculateBudget();

        // 2.Method to return the budget
        var budget = budgetCtrl.getBudget();
        
        // 3. Display the budget on the UI
        UICtrl.displayBudget(budget);

    };

    var updatePercentages = function() {
        // 1. Calculate percentages
        budgetController.calculatePercentages();

        // 2. Read percentages from the budget controller
        var percentages = budgetController.getPercentages();

        // 3. Update the user interface with the new percentages
        UICtrl.displayPercentages(percentages);
    };

    // Add Item controller function
    var ctrlAddItem = function() {
        var input, newItem;
        
        // 1. Get the field input data
        input = UICtrl.getInput();

        // Check if the entered value is valid
        if (input.description != "" && !isNaN(input.value) && input.value > 0) {
            // 2. Add the item to the budget controller
        newItem = budgetCtrl.addItem(input.type, input.description, input.value);
        
        // 3. Add the item to the UI
        UICtrl.addListItem(newItem, input.type);

        // 4. Clear the fields
        UICtrl.clearFields();

        // 5. Calculate and update budget
        updateBudget();

        // 6. Calculate and update percentages
        updatePercentages();
        }
        
    };
    
    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID;
       /* // Console Logging the upper parent Node and getting its ID
        console.log(event.target.parentNode.parentNode.parentNode.parentNode.id);
        */

        // Getting the parent node ID and saving it in a variable
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        // Since no other parts have an ID exept the delete button we can use it to perform operation only on items havin an ID, that is the delete button (i.e. clicking anywhere else won't do anything but on the delete button)
            splitID = itemID.split('-');            // splits at - and returns an array
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // 1. Delete the item from the data structure
            budgetController.deleteItem(type, ID);

            // 2. Delete the item from the user interface
            UICtrl.deleteList(itemID);

            // 3. Update and show the new Budget
            updateBudget();

            // 4. Calculate and update percentages
            updatePercentages();

            
    };

    // Public function to call some functions (or initialise)
    return {
        init: function() {
            console.log('The program has started.');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    };
    
})(budgetController, UIController);

controller.init();
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    