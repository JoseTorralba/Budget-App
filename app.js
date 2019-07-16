// BUDGET CONTROLLER
var budgetController = (function() {

    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    // Calculates The Percentage
    Expense.prototype.calcPercentage = function(totalIncome) {

        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };
    // Returns The Percentage
    Expense.prototype.getPercentage = function() {
        return this.percentage;
    }

    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function(type) {
        var sum = 0;

        data.allItems[type].forEach(function(cur) {
            sum += cur.value;
        });
        data.totals[type] = sum;
    }

    var data = {
        allItems: {
            exp: [],
            inc: []
        },

        totals: {
            exp: 0,
            inc: 0
        },

        budget: 0,
        percentage: -1
    };

    return {
        addItem: function(type, des, val) {
            var newItem;

            // Creates New ID for new Pushed Iten
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            // Creates New Item Based on Inc or Exp Type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            // Pushes it into Data Structure
            data.allItems[type].push(newItem);
            
            // Returns New Element
            return newItem;
        },

        deleteItem: function(type, id) {
            var ids, index;

            // Map recieves a callback function which also has access to the current element, index, and entire array
            // Map returns a new Array
            ids = data.allItems[type].map(function(current) {
                return current.id;  
            });
            
            // index of the id that we passed into the method
            // indexOf returns the index number of the element of the array that we input in 'id'
            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: function() {

            // Calculate Total Income and Expenses
            calculateTotal('exp');
            calculateTotal('inc');

            // Calculate The Budget:  Income - Expenses
            data.budget = data.totals.inc - data.totals.exp;

            // Calculate The Percentages of Income that we spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = - 1;
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
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },

        testing: function() {
            console.log(data)
        }
    }
})();

// USER INTERFACE CONTROLLER
var UIController = (function() {

    var DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        precentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    var formatNumber =  function(num, type) {
        var numSplit, int, dec, type;

        // abs removes the sign of the number
        num = Math.abs(num);
        num = num.toFixed(2);

        // Divides the num into 2 parts
        numSplit = num.split('.');

        int = numSplit[0];

        // If it's more than a thousand
        if (int.length > 3) {
            // First # in sub string is the position of the string, second # reads the numbers
            int = int.substr(0, int.length - 3) + ',' +int.substr(int.length - 3, 3);
        }
        dec = numSplit[1];

        // Ternary Operator
        // In parenthesis, will execute first
        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;

    };

    // We create this for loop to then reuse it in the forEach
    var nodeListForEach = function(list,callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i)
        }
    };

    return {
        getInput: function() {
            return {
                type: document.querySelector(DOMStrings.inputType).value,
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
                // parseFloat converts a string into a number with decimals
            }
        },

        addListItem: function(obj, type) {
            var html, newHtml, element, fields, fieldsArr;

            // Create HTML string with placeholder Text
            if (type === 'inc') {
                element = DOMStrings.incomeContainer;

                html = `<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>`;

            } else if (type === 'exp') {
                element = DOMStrings.expensesContainer;

                html = `<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>`;
            }

            // Then replace placeholder text with actual data using the replace method
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            // Insert HTML into DOM using adjacentHtml
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        deleteListItem: function(selectorID) {
            // To use the removeChild method, we have to know the parent. parentNode is used to move up one parent
            var el = document.getElementById(selectorID)
            el.parentNode.removeChild(el)
        },

        clearFields: function() {

            fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue);
            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function(current, index, array) {
                current.value = "";
            });

            // sets focus on the first Array
            fieldsArr[0].focus();
        },

        displayBudget: function(obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : 'exp';

            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber( obj.totalInc, 'inc');
            document.querySelector(DOMStrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

            if (obj.percentage > 0) {
                document.querySelector(DOMStrings.precentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMStrings.precentageLabel).textContent = '---';
            };
        },

        displayPercentages: function(percentages) {

            // Returns a Node List, each element is stored as a Node
            var fields = document.querySelectorAll(DOMStrings.expensesPercLabel);

            nodeListForEach(fields, function(current, index) {

                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
        },

        displayMonth: function() {
            var now, months, month, year;

            now = new Date();

            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();

            year = now.getFullYear();

            document.querySelector(DOMStrings.dateLabel).textContent = months[month] + ' ' + year;
        },

        changedType: function() {

            var fields = document.querySelectorAll(
                DOMStrings.inputType + ',' +
                DOMStrings.inputDescription + ',' +
                DOMStrings.inputValue
            );

            nodeListForEach(fields, function(cur) {
                cur.classList.toggle('red-focus')
            });

            document.querySelector(DOMStrings.inputBtn).classList.toggle('red');
        },

        getDOMstrings: function() {
            return DOMStrings;
        },
    }
})();


// Best practice instead of using the methods name itself
// GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl) {

    // Add Button & Keypress Event Listeners
    var setupEventListeners = function() {
        var DOM = UICtrl.getDOMstrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
        document.addEventListener('keypress', function(event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            };
        });
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };

    var updateBudget = function() {
        // 1. Calculate the Budget
        budgetCtrl.calculateBudget();

        // 2. Return the Budget
        var budget = budgetCtrl.getBudget();

        // 3. Display the Budget on the UI
        UICtrl.displayBudget(budget);
    };

    var updatePercentages = function() {
        // 1. Calculate Percentages
        budgetCtrl.calculatePercentages();

        // 2. Read Percentages from the Budget Controller
        var percentages = budgetCtrl.getPercentages();

        // 3. Update the UI with new Percentages
        UICtrl.displayPercentages(percentages);
    };

    var ctrlAddItem = function() {
        var input, newItem;

        // 1. Get Field Input Data
        input = UICtrl.getInput();

        // If Description is not empty, is not NaN, and if input value is greater than 0
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {

            // 2. Add Item to Budget Controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. Add Item to UI
            UICtrl.addListItem(newItem, input.type);

            // 4. Clear the Fields
            UICtrl.clearFields();

            // 5. Calculate and Update the Budget
            updateBudget();

            // 6. Calculate & Update Percentages
            updatePercentages();
        };
    };

    // event targets the element
    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID;

        // ParentNode Goes up by one Parent
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {

            // Split Gets what comes before(inc) and after(1) '-' from inc-1 or exp-1
            splitID = itemID.split('-');
            type = splitID[0];

            // Converts String into an ID
            ID = parseInt(splitID[1]);

            // 1. Deletes Item from Data Structure
            budgetCtrl.deleteItem(type, ID);

            // 2. Deletes Item from User Interface
            UICtrl.deleteListItem(itemID)

            // 3.Update and Show new Budget
            updateBudget();

            // 4. Calculate & Update Percentages
            updatePercentages();
        };
    };

    return {
        init: function() {
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