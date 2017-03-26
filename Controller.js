app.controller('DebtController', ['$scope',function($scope){
    $scope.noneSelected = true;
    $scope.snowballSelected = false;
    $scope.avalancheSelected = false;
    $scope.loans = [];
    $scope.additionalMonthlyPayment = 0.00;
    $scope.allDebtsHidden = true;
    $scope.hiddenSchedule = true;
    $scope.cascadePayments = true;
    $scope.calcButtonText = "Calculate";
    
     var loan = {
        index:0,
        name:"",
        principle:0.00,
        term:1,
        interestRate:0.00,
        minimumMonthlyPayment:0.00,
        schedule: []
        //,carryOver:false
    };

    var payment = {
        paymentAmount:0.00,
        principleRemaining:0.00,
        towardInterest:0.00,
        towardPrinciple:0.00,
        currentPaidOverall:0.00,
        currentInterestPaid:0.00,
        date: ""
    };
    
    /*
        in:
        out: 
        purpose: create and add empty loan to the scope. Should occur on pageload and reset
    */
    $scope.Init = function(){
        var firstLoan = angular.copy(loan); 
        $scope.loans.push(firstLoan);
    }
    
    /*
        in:
        out: 
        purpose: switch sorting method and make call to regenerate schedules
    */
    $scope.SwitchToAvalancheMethod = function(){
        $scope.noneSelected = false;
        $scope.snowballSelected = false;
        $scope.avalancheSelected = true;
        $scope.GenerateSchedules();
    }
    
    /*
        in:
        out: 
        purpose: switch sorting method and make call to regenerate schedules
    */
    $scope.SwitchToSnowballMethod = function(){
        $scope.noneSelected = false;
        $scope.snowballSelected = true;
        $scope.avalancheSelected = false;
        $scope.GenerateSchedules();
    }
    
    /*
        in:
        out: 
        purpose: switch sorting method and make call to regenerate schedules
    */
    $scope.SwitchToNoMethod = function(){
        $scope.noneSelected = true;
        $scope.snowballSelected = false;
        $scope.avalancheSelected = false;
        $scope.GenerateSchedules();
    }
    
    /*
        in:
        out: 
        purpose: creates loan and adds to scope array
    */
    $scope.AddLoan = function(){
        var additionalLoan = angular.copy(loan);
        //index property is to keep track for sorting purposes
        additionalLoan.index = $scope.loans.length;
        $scope.loans.push(additionalLoan);
    }
    
    /*
        in:
        out: 
        purpose: validates input and calls the sorting and schedule generation methods
    */
    $scope.GenerateSchedules = function(){
        if($scope.loans.length == 0){
            alert("No debt found! Please enter 1 or more debts.");
 //       else if(TODO: check input for huge numbers and alert){
            
        }else{
            $scope.allDebtsHidden = false;
            for(var i = 0; i < $scope.loans.length; i++){
                $scope.loans[i].schedule = $scope.Amortization($scope.loans[i]);
            }
            
            //only sort and cascade if necessary
            if($scope.loans.length > 1){
                $scope.OrderByChosenMethod();
            }        
        }    
    }
    
    /*
        in:
        out: 
        purpose: based on selected sorting method, sort the scope array
    */
    $scope.OrderByChosenMethod = function(){
        if($scope.loans.length > 1){
            if($scope.avalancheSelected){
                $scope.loans.sort(function(a,b){return b.interestRate - a.interestRate}); 
            }else if($scope.snowballSelected){
                $scope.loans.sort(function(a,b){return a.principle - b.principle});  
            }else{
                $scope.loans.sort(function(a,b){return a.index - b.index});  
            }

            //after sorting, go through each loan and apply the remainder of the previous loan's last month payment to the next loan in the same month
            if($scope.cascadePayments){
                $scope.CascadeShorterLoans();
            }
        }
    }
    
    /*
        in:
        out: 
        purpose: toggles the cascading property and regenerates the schedules
    */
    $scope.ToggleCascade = function(){
        $scope.cascadePayments = !$scope.cascadePayments;
        $scope.GenerateSchedules();
    }
    
    /*
        in: 
        out: 
        purpose: apply shorter loans' payments to longer loans
    */
    $scope.CascadeShorterLoans = function(){
        var sortedLoans = $scope.loans.slice();
        sortedLoans = sortedLoans.sort(function(a,b){return a.schedule.length - b.schedule.length});
        var shortestLoan, currentLoan, prevLoan, cascaded, indexOfShortest, startIndex, lastPayment, paymentToApply, payment, isPreviousShorter;
        var shortestHasBeenVisited = false;
        //var carriedSum = 0;

        shortestLoan = sortedLoans[0];
        startIndex = shortestLoan.schedule.length;
        for(var i = 0 ; i < $scope.loans.length; i++){
            currentLoan = $scope.loans[i];
            if(currentLoan.index == shortestLoan.index){
                shortestHasBeenVisited = true;
                continue;
            }

            if(shortestHasBeenVisited){
                cascaded = FindSumOfPreviousPayments(i, $scope.loans);
            }else{
                //if the shortest loan is after the current, then its payment needs to be manually cascaded
                cascaded = FindSumOfPreviousPayments(i, $scope.loans) +  Math.round(shortestLoan.minimumMonthlyPayment * 100) / 100;
            }
            //check the length of the previous loan to see if payment can be applied to the current loan
            if(i > 0){
                prevLoan = $scope.loans[i-1];
                //if previous loan was shortest, skip it to get the accurate start date and carryover
                if(prevLoan.index == shortestLoan.index && i > 1){
                        prevLoan = $scope.loans[i-2];
                }

                if(currentLoan.schedule.length > prevLoan.schedule.length){
                    isPreviousShorter = true;   
                }else{
                    isPreviousShorter = false;   
                }
            }else{
                prevLoan = shortestLoan;
                isPreviousShorter = true;    
            }

            //apply the payment of the shortest to the first eligible loan 
            //that is still being paid after the final month of the shortest term loan
            if(isPreviousShorter){ //&& currentLoan.schedule.length > shortestLoan.schedule.length
                lastPayment = prevLoan.schedule[prevLoan.schedule.length - 1].paymentAmount;
                //carriedSum = $scope.SumPreviousCarryOvers(i);
                //if the last payment was not fully needed, apply the difference to the higher priority loan in the same month
                if((Math.round(lastPayment * 100) / 100) < ((Math.round(cascaded * 100) / 100))){// && !tieForShortest){
                    paymentToApply = cascaded - lastPayment;
                    currentLoan = $scope.ApplyPaymentToLoan(currentLoan.minimumMonthlyPayment + paymentToApply, currentLoan, startIndex - 1, startIndex);
                }
   
                //apply payment 1 at a time and user the paymentamount instead of blanket min + cascaded
                for(var j = startIndex; j < currentLoan.schedule.length;j++){
                    payment = currentLoan.schedule[j];
                    currentLoan = $scope.ApplyPaymentToLoan(payment.paymentAmount + cascaded, currentLoan, j, j+1); 
                }
 
                $scope.loans[i] = currentLoan;
            }  
            startIndex = currentLoan.schedule.length;
        }
    }
    
    //TODO
    $scope.SumPreviousCarryOvers = function(index) {
        if(index > 0){
            var sum = 0;
            var carriedLoans = $scope.loans.slice(0, index).filter(function(loan){
                return loan.carryOver == true;
            });
            if(carriedLoans.length > 0){
                sum = carriedLoans.reduce(function(total,num){
                    return {minimumMonthlyPayment: total.minimumMonthlyPayment + num.minimumMonthlyPayment};
                });
                if(sum == undefined){
                    sum = 0;   
                }
            }
            return sum;
        }else{
            return 0;   
        }
    }
    
    
    //TODO: set up a watch on both the loans array and additionalMonthlyPayment
    $scope.ShowTotalMonthlyPayment = function(){
        return FindSumOfPreviousPayments($scope.loans.length, $scope.loans);// + $scope.additionalMonthlyPayment;   
    }

    /*
        in: payment amount
        in: loan object
        in: start index of payment
        in: end index of payment
        out:  new loan with payment applied
        purpose: apply given payment to given loan
    */
    $scope.ApplyPaymentToLoan = function(amount, loan, startIndex, endIndex){
        var previousPaymentInterest, previousPaymentTotal, principle, currentPayment;
        //check inputs
        if(startIndex > loan.schedule.length || endIndex > loan.schedule.length || startIndex > endIndex){
            return loan;    
        }
        
        for(var j = startIndex; j < endIndex; j++){
            if(j == 0){
                previousPaymentInterest = 0.00;
                previousPaymentTotal = 0.00;
                principle = loan.principle;
            }else{
                previousPaymentInterest = loan.schedule[j-1].currentInterestPaid;
                previousPaymentTotal = loan.schedule[j-1].currentPaidOverall;
                principle = loan.schedule[j-1].principleRemaining;
            }
            currentPayment = ApplyPayment(loan.schedule[j], amount, loan.interestRate, previousPaymentInterest, previousPaymentTotal, principle);

            if(currentPayment.principleRemaining <= 0){
                currentPayment = ReconcilePaymentAfterPayoff(currentPayment);
                //set carryOver prop to true if the final payment is less than the min
//                if((Math.round(currentPayment.paymentAmount * 100) / 100) <= (Math.round(loan.minimumMonthlyPayment * 100) / 100)){
//                    $scope.loans[loan.index].carryOver = true;
//                }
                //if not at the end of the payment schedule yet, cut off the remaining payments
                if(j < loan.schedule.length){
                    loan.schedule.splice(j+1,loan.schedule.length);
                }  

                loan.schedule[j] = currentPayment;
                break;   
            }
            principle = currentPayment.principleRemaining;
            previousPaymentTotal += currentPayment.paymentAmount;
            previousPaymentInterest += currentPayment.towardInterest;
            loan.schedule[j] = currentPayment;
        }
        return loan;
    }
    
    //TODO
    $scope.ApplyAdditionalPaymentsToLoans = function(additional){
        var principle, previousPaymentTotal, previousInterestTotal, currentLoan, currentPaymentSchedule, currentPayment, nextExtraPaymentStartDate, startDateIndex, prevLoan, prevLoanLastPayment, currentLoan, difference;
        //start the additional payments on the first loan from the start date. all others will start the additional payments after each subsequent loan has been paid
        startDateIndex = 0;
        for(var i = 0; i < $scope.loans.length; i++){
            
            currentLoan = $scope.loans[i];
            currentPaymentSchedule = currentLoan.schedule;
            //check previous loan for carryover and to determine if current loan is longer or shorter in term
            if(i>0){
                prevLoan = $scope.loans[i-1];
                if(prevLoan.schedule.length > currentLoan.schedule.length){
                    continue;   
                }
                else{
                    prevLoanLastPayment = prevLoan.schedule[prevLoan.schedule.length - 1].paymentAmount;
                    if(prevLoanLastPayment < prevLoan.minimumMonthlyPayment){
                        currentPayment = currentLoan.schedule[0].paymentAmount;
                        difference = (prevLoan.minimumMonthlyPayment + additional) - prevLoanLastPayment;
                        currentLoan = $scope.ApplyPaymentToLoan(currentPayment + difference, currentLoan, startDateIndex-1, startDateIndex);
                    }
                } 
            }
            //add 1 to start the additional payment in the month after the previous is paid off
            for(var j = startDateIndex; j < currentPaymentSchedule.length; j++)
            {
                currentPayment = currentPaymentSchedule[j].paymentAmount;
                currentLoan = $scope.ApplyPaymentToLoan(currentPayment + additional, currentLoan, j, j+1);
            }
            $scope.loans[i] = currentLoan;
            startDateIndex = currentPaymentSchedule.length;
        }  
    }
    
    function FindIndexOfObjectWithProperty(array, prop, val){
        for(var i = 0; i < array.length; i++){
            if(array[i][prop] === val ){
                return i;   
            }
        }
        return -1;
    }
    
    //TODO instead of updating scope.loans everywhere, call this everytime and pass it in
//    $scope.UpdateOverallLoans = function(newLoan, index){
//        if(index > $scope.loans.length){
//            //ERROR   
//        }
//        //hasOwnProperty checks object (not prototype chain) for given props
//        if(newLoan.hasOwnProperty("schedule")){
//            $scope.loans[index].schedule = newLoan.schedule;
//        }
//        //repeat for other properties?
//    }
    
    /*
        in:
        out:
        purpose: reset all values back to stock
    */
    $scope.ResetLoans = function(){
        $scope.noneSelected = true;
        $scope.snowballSelected = false;
        $scope.avalancheSelected = false;
        $scope.loans = [];
        $scope.unsortedLoans = [];
        $scope.totalMonthlyPayment = 0;
        $scope.additionalMonthlyPayment = 0;
        $scope.allDebtsHidden = true;
        $scope.hiddenSchedule = true; 
        $scope.cascadePayments = true;
        $scope.Init();
    }
    
    /*
        in: loan object with user's entered form data
        out:  new payment schedule
        purpose: create initial payment schedule using the basic starting values
    */
    $scope.Amortization = function(loan){
            //alert(loan.principle + ' ' + loan.interestRate + ' ' + loan.term + ' ' + loan.minimumMonthlyPayment);
            var principle = loan.principle;
            var schedule = [];
            var currentDate = new Date();
            currentDate.setMonth(currentDate.getMonth() + 1);
            var previousPaymentTotal = 0.00;
            var previousInterestTotal = 0.00;
            var currentPayment;
            //if condition is (principle >= 0), it causes infinite loop
            while(principle >= 0.01){
                //console.log(principle);
                currentPayment = angular.copy(payment);
                currentPayment = ApplyPayment(currentPayment, loan.minimumMonthlyPayment, loan.interestRate, previousInterestTotal, previousPaymentTotal, principle);
                currentPayment.date = FormatDate(currentDate);
                if(currentPayment.principleRemaining < 0){
                    currentPayment = ReconcilePaymentAfterPayoff(currentPayment) 
                }
                principle = currentPayment.principleRemaining;
                previousPaymentTotal += currentPayment.paymentAmount;
                previousInterestTotal += currentPayment.towardInterest;
                currentDate.setMonth(currentDate.getMonth() + 1);//new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
                schedule.push(currentPayment);
            }
        return schedule;
    };
    
    /*
        in: payment object
        in: payment amount
        in: interest rate
        in: previous interest paid total
        in: previous overall amount paid
        in: current principle left before payment applied
        out:  new payment with rebalanced numbers
        purpose: populate payment object with associated values
    */
    function ApplyPayment(currentPayment, amount, interestRate, prevInterest, prevPayment, principle){
        var monthlyInterestRate = (interestRate/100) / 12;
        currentPayment.paymentAmount = amount;//loan.minimumMonthlyPayment + additional;
        currentPayment.currentPaidOverall = prevPayment + currentPayment.paymentAmount;
        currentPayment.towardInterest = principle * monthlyInterestRate;
        currentPayment.currentInterestPaid = prevInterest + currentPayment.towardInterest;
        currentPayment.towardPrinciple = currentPayment.paymentAmount - currentPayment.towardInterest;
        currentPayment.principleRemaining = principle - currentPayment.towardPrinciple;
        return currentPayment;
    }
    
    /*
        in: payment object
        out:  new payment with rebalanced numbers
        purpose: subtract (add) the amount less than zero from the payment amount and recalculate
    */
    function ReconcilePaymentAfterPayoff(payment){
        payment.paymentAmount = payment.paymentAmount + payment.principleRemaining;
        payment.currentPaidOverall += payment.principleRemaining;
        payment.towardPrinciple = payment.paymentAmount - payment.towardInterest;
        payment.principleRemaining = 0;  
        return payment;
    }
    
    /*
        in: index of current loan
        in: array of loan objects
        out:  sum of minimum payments from all previous loans to the parameter
        purpose: find the sum of the monthly payment amounts from all loans before the parameter
    */
    function FindSumOfPreviousPayments(currentLoanIndex, loans){
        if(currentLoanIndex > 0){
            var sum = 0;
            var slicedLoans = loans.slice(0, currentLoanIndex);
            sum = slicedLoans.reduce(function(total,num){
                return {minimumMonthlyPayment: total.minimumMonthlyPayment + num.minimumMonthlyPayment};
            });
            return sum.minimumMonthlyPayment;
        }else{
            return 0;    
        }
    }
    
    /*
        in: unformatted date object
        out: string in mmm yyyy format (e.g. Dec 2016)
        purpose: formats date to display in payment schedule
    */
    function FormatDate(unformattedDate){
        var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];  
        return months[unformattedDate.getMonth()].substring(0,3) + " " + unformattedDate.getFullYear(); 
    }
    
    //begin initialization
    $scope.Init();
}]);