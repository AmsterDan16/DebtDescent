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
//    $scope.showSchedule = function(){
//        $scope.hiddenSchedule = !$scope.hiddenSchedule;  
//    };
    
    $scope.SwitchToAvalancheMethod = function(){
        $scope.noneSelected = false;
        $scope.snowballSelected = false;
        $scope.avalancheSelected = true;
        $scope.GenerateSchedules();//$scope.OrderByChosenMethod();
    };
    
    $scope.SwitchToSnowballMethod = function(){
        $scope.noneSelected = false;
        $scope.snowballSelected = true;
        $scope.avalancheSelected = false;
        $scope.GenerateSchedules();//$scope.OrderByChosenMethod();
    };
    
    $scope.SwitchToNoMethod = function(){
        $scope.noneSelected = true;
        $scope.snowballSelected = false;
        $scope.avalancheSelected = false;
        $scope.GenerateSchedules();//$scope.OrderByChosenMethod();
    };

    var loan = {
        index:0,
        name:"",
        principle:0.00,
        term:1,
        interestRate:0.00,
        minimumMonthlyPayment:0.00,
        schedule: []
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
    
    $scope.Init = function(){
        var firstLoan = angular.copy(loan); 
        $scope.loans.push(firstLoan);
    }
    
    $scope.AddLoan = function(){
        var additionalLoan = angular.copy(loan);
        //make the index the length
        additionalLoan.index = $scope.loans.length;
        $scope.loans.push(additionalLoan);
    }
    /*
        in: unformatted date object
        out: string in mmm yyyy format (e.g. Dec 2016)
    */
    function formatDate(unformattedDate){
        var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];  
        return months[unformattedDate.getMonth()].substring(0,3) + " " + unformattedDate.getFullYear(); 
    }

    
    $scope.GenerateSchedules = function(){
        if($scope.loans.length == 0){
            alert("No debt found! Please enter 1 or more debts.");
        //else if(TODO: check input for huge numbers and alert){
            
        }else{
            $scope.allDebtsHidden = false;
            var loan;
            for(var i = 0; i < $scope.loans.length; i++){
                //alert($scope.loans[i].name);
                $scope.loans[i].schedule = $scope.Amortization($scope.loans[i]);
            }
            
            /*save the original order only after it is first entered.
            *also check for newly added debts
            */
//            if(!$scope.isSorted){
//                $scope.unsortedLoans = $scope.loans.slice(0);
//            }
            
            
            //TODO: fix the additional payments
            //after schedules are set and the loans are sorted, apply the additional payments
            
            //only sort and cascade if necessary
            if($scope.loans.length > 1){
                $scope.OrderByChosenMethod();
            }else{
                if($scope.additionalMonthlyPayment > 0.00){
                    $scope.ApplyAdditionalPaymentsToLoans($scope.additionalMonthlyPayment);
                }
            }
            
            
        }    
    }
    
//    $scope.ResetLoansToOriginalSpecs = function(){
//        
//        for(var i = 0; i < $scope.loans.length; i++){
//               
//        }
//    }
    
    $scope.OrderByChosenMethod = function(){
        if($scope.loans.length > 1){
            if($scope.avalancheSelected){
                $scope.loans.sort(function(a,b){return b.interestRate - a.interestRate}); 
                //$scope.isSorted = true;
            }else if($scope.snowballSelected){
                $scope.loans.sort(function(a,b){return a.principle - b.principle});  
                //$scope.isSorted = true;
            }else{
                $scope.loans.sort(function(a,b){return a.index - b.index});  
                //$scope.loans = $scope.unsortedLoans.slice(0);
                //$scope.isSorted = false;
            }
            //apply the optional additional payment
            if($scope.additionalMonthlyPayment > 0.00){
                //$scope.ApplyAdditionalPaymentsToLoans($scope.additionalMonthlyPayment);
            }
            //after sorting and applying the extra payment, go through each loan and apply the remainder of the previous loan's last month payment to the next loan in the same month
            if($scope.cascadePayments){
                $scope.CascadeShorterLoans();
                //$scope.reverseCascadeShorterLoans();
                //$scope.CascadePaymentRemaindersToNext();
            }
        }
    }
    
    //toggle property and recalculate
    $scope.ToggleCascade = function(){
        $scope.cascadePayments = !$scope.cascadePayments;
        $scope.GenerateSchedules();
    }
    
//    $scope.CascadePaymentRemaindersToNext = function(){
//        //TODO: if future loans have shorter terms, still must apply their payments to previous once they are paid off
//        $scope.reverseCascadeShorterLoans();
//        var addedPaymentForNextLoan = 0;
//        var secondToLastPayment, lastPayment, difference, prevLoan, currentLoan, nextPaymentIndex, extraAvailableAmount;
//        //start from second loan
//        for(var i = 1; i < $scope.loans.length; i++){
//            prevLoan = $scope.loans[i-1];
//            currentLoan = $scope.loans[i];
//            lastPayment = prevLoan.schedule[prevLoan.schedule.length - 1].paymentAmount;
//            //find when to roll over the leftover amount
//            nextPaymentIndex = $scope.FindIndexOfObjectWithProperty(currentLoan.schedule, "date", prevLoan.schedule[prevLoan.schedule.length - 1].date);
//            //TODO: round to 2 places
//            //find the total amount leftover from previous loans available to apply to current loans
//            extraAvailableAmount = Math.round(($scope.FindSumOfPreviousPayments(i) + $scope.additionalMonthlyPayment) - lastPayment);
//      
//            if(extraAvailableAmount > 0){
//                //apply the difference in total extra available money sent to the last payment of the previous loan to the payment 
//                //in the current loan of the same month
//                $scope.loans[i] = $scope.ApplyPaymentToLoan(currentLoan.schedule[nextPaymentIndex].paymentAmount + extraAvailableAmount, currentLoan, nextPaymentIndex, nextPaymentIndex + 1); 
//                //then apply the standard cascaded payment to the rest of the payments
//                $scope.loans[i] = $scope.ApplyPaymentToLoan(currentLoan.schedule[nextPaymentIndex + 1].paymentAmount + $scope.FindSumOfPreviousPayments(i), currentLoan, nextPaymentIndex + 1, currentLoan.schedule.length -1);   
//            }else{
//                //apply the total previous loan payment to the next loan at all indices after the previous loans are paid off
//                $scope.loans[i] = $scope.ApplyPaymentToLoan(currentLoan.schedule[nextPaymentIndex].paymentAmount + $scope.FindSumOfPreviousPayments(i), currentLoan, nextPaymentIndex + 1, currentLoan.schedule.length -1); 
//            }  
//        }
//        //TODO: check if previous loans will outlive the current. If so, apply their payments to the previous
//        //$scope.reverseCascadeShorterLoans();
//    }
    
    $scope.CascadeShorterLoans = function(){
        var sortedLoans = $scope.loans.slice();
        sortedLoans = sortedLoans.sort(function(a,b){return a.schedule.length - b.schedule.length});
        var shortestHasBeenVisited = false;
        var shortestLoan, currentLoan, prevLoan, cascaded, indexOfShortest, startIndex, lastPayment, paymentToApply, isPreviousShorter;
        //while(sortedLoans.length > 1){
            shortestLoan = sortedLoans[0];
            startIndex = shortestLoan.schedule.length;
            for(var i = 0; i < $scope.loans.length; i++){
                currentLoan = $scope.loans[i];
                //if shortest has already been visited, cascaded does not include minPayment
                if(currentLoan.index == shortestLoan.index){
                    shortestHasBeenVisited = true;
                    continue;
                }
                if(shortestHasBeenVisited){
                    cascaded = $scope.FindSumOfPreviousPayments(i);
                }else{
                    cascaded = $scope.FindSumOfPreviousPayments(i) +  Math.round(shortestLoan.minimumMonthlyPayment * 100) / 100;
                }
                //check the length of the previous loan to see if payment can be applied to the current loan
                if(i > 0){
                    prevLoan = $scope.loans[i-1];
                    if(prevLoan.index == shortestLoan.index){
                        if(i == 1){
                            prevLoan = $scope.loans[i-1];
                        }else{
                            prevLoan = $scope.loans[i-2];
                        }
                        //cascaded -= shortestLoan.minimumMonthlyPayment;
                    }
                    if(currentLoan.schedule.length > prevLoan.schedule.length){
                        isPreviousShorter = true;   
                    }else{
                        isPreviousShorter = false;   
                    }
                }else{
//                    if(currentLoan.index == shortestLoan.index){
//                        continue;   
//                    }
                    prevLoan = shortestLoan;
                    isPreviousShorter = true;    
                }
                
                //apply the payment of the shortest to the first eligible loan 
                //that is still being paid after the final month of the shortest term loan
                if(isPreviousShorter && currentLoan.index != shortestLoan.index){
                    lastPayment = prevLoan.schedule[prevLoan.schedule.length - 1].paymentAmount;
                    //if the last payment was not fully needed, apply the difference to the higher priority loan in the same month
                    if((Math.round(lastPayment * 100) / 100) < ((Math.round(cascaded * 100) / 100))){// + $scope.additionalMonthlyPayment)){
                        paymentToApply = cascaded - lastPayment;//(cascaded + $scope.additionalMonthlyPayment) - lastPayment;//prevLoan.schedule[prevLoan.schedule.length - 1].paymentAmount;
                        currentLoan = $scope.ApplyPaymentToLoan(currentLoan.minimumMonthlyPayment + paymentToApply, currentLoan, startIndex - 1, startIndex);
                    }
                    currentLoan = $scope.ApplyPaymentToLoan(currentLoan.minimumMonthlyPayment + cascaded, currentLoan, startIndex, currentLoan.schedule.length);   
                    $scope.loans[i] = currentLoan;
                    
//                }  
//                if(currentLoan.index == shortestLoan.index){
//                    continue;
//                }else{
                startIndex = currentLoan.schedule.length;
//                }
            //}
            //remove current shortest so the next shortest can be checked
            //sortedLoans.shift();
        }

    }
}
    
    //TODO:start from beginning or the end?
//    $scope.reverseCascadeShorterLoans = function(){
//        /*psuedo:
//            find shortest loan. if tie, tie goes to loan later in list
//            apply payment to the first loan longer than it as high in list as possible
//                check length against previous starting with first
//                    if shorter length, then apply payments from last loan to first until done
//        
//        */
//        var sortedLoans = $scope.loans.slice();
//        sortedLoans = sortedLoans.sort(function(a,b){return a.schedule.length - b.schedule.length});
//        var shortestLoan, currentLoan, prevLoan, cascaded, indexOfShortest, startIndex, lastPayment, paymentToApply, isPreviousShorter;
//        while(sortedLoans.length > 1){
//            shortestLoan = sortedLoans[0];
//            startIndex = shortestLoan.schedule.length;
//            for(var i = 0 ; i < shortestLoan.index; i++){
//                currentLoan = $scope.loans[i];
//                cascaded = $scope.FindSumOfPreviousPayments(i) +  Math.round(shortestLoan.minimumMonthlyPayment * 100) / 100;
//                //check the length of the previous loan to see if payment can be applied to the current loan
//                if(i > 0){
//                    prevLoan = $scope.loans[i-1];
//                    if(currentLoan.schedule.length > prevLoan.schedule.length){
//                        isPreviousShorter = true;   
//                    }else{
//                        isPreviousShorter = false;   
//                    }
//                }else{
//                    prevLoan = shortestLoan;
//                    isPreviousShorter = true;    
//                }
//                
//                //apply the payment of the shortest to the first eligible loan 
//                //that is still being paid after the final month of the shortest term loan
//                if(currentLoan.schedule.length > shortestLoan.schedule.length && isPreviousShorter){
//                    lastPayment = prevLoan.schedule[prevLoan.schedule.length - 1].paymentAmount;
//                    //if the last payment was not fully needed, apply the difference to the higher priority loan in the same month
//                    if((Math.round(lastPayment * 100) / 100) < ((Math.round(cascaded * 100) / 100) + $scope.additionalMonthlyPayment)){
//                        paymentToApply = (cascaded + $scope.additionalMonthlyPayment) - lastPayment;//prevLoan.schedule[prevLoan.schedule.length - 1].paymentAmount;
//                        currentLoan = $scope.ApplyPaymentToLoan(currentLoan.minimumMonthlyPayment + paymentToApply, currentLoan, startIndex - 1, startIndex);
//                    }
//                    currentLoan = $scope.ApplyPaymentToLoan(currentLoan.minimumMonthlyPayment + cascaded, currentLoan, startIndex, currentLoan.schedule.length);   
//                    $scope.loans[i] = currentLoan;
//                    
//                }  
//                startIndex = currentLoan.schedule.length;
//            }
//            //remove current shortest so the next shortest can be checked
//            sortedLoans.shift();
//        }
//    }
    
    //find the sum of the monthly payment amounts from all loans before the current one to cascade them
    $scope.FindSumOfPreviousPayments = function(currentLoanIndex){
        if(currentLoanIndex > 0){
            var sum = 0;
            var slicedLoans = $scope.loans.slice(0, currentLoanIndex);
            sum = slicedLoans.reduce(function(total,num){
                return {minimumMonthlyPayment: total.minimumMonthlyPayment + num.minimumMonthlyPayment};
            });
            return sum.minimumMonthlyPayment;
        }else{
            return 0;    
        }
    }
    
    //TODO: set up a watch on both the loans array and additionalMonthlyPayment
    $scope.ShowTotalMonthlyPayment = function(){
        return $scope.FindSumOfPreviousPayments($scope.loans.length) + $scope.additionalMonthlyPayment;   
    }

    
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
            currentPayment = $scope.ApplyPayment(loan.schedule[j], amount, loan.interestRate, previousPaymentInterest, previousPaymentTotal, principle);

            if(currentPayment.principleRemaining <= 0){
                currentPayment = $scope.ReconcilePaymentAfterPayoff(currentPayment);
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
//                else{
//                    prevLoanLastPayment = prevLoan.schedule[prevLoan.schedule.length - 1].paymentAmount;
//                    if(prevLoanLastPayment < prevLoan.minimumMonthlyPayment){
//                        currentPayment = currentLoan.schedule[0].paymentAmount;
//                        difference = (prevLoan.minimumMonthlyPayment + additional) - prevLoanLastPayment;
//                        currentLoan = $scope.ApplyPaymentToLoan(currentPayment + difference, currentLoan, startDateIndex-1, startDateIndex);
//                    }
//                } 
            }
            //add 1 to start the additional payment in the month after the previous is paid off
            for(var j = startDateIndex; j < currentPaymentSchedule.length; j++)
            {
                currentPayment = currentPaymentSchedule[j].paymentAmount;
                currentLoan = $scope.ApplyPaymentToLoan(currentPayment + additional, currentLoan, j, j+1);
            }
            $scope.loans[i] = currentLoan;
            //nextExtraPaymentStartDate = currentPaymentSchedule[currentPaymentSchedule.length - 1].date;
            startDateIndex = currentPaymentSchedule.length;//$scope.FindIndexOfObjectWithProperty(currentPaymentSchedule, "date", nextExtraPaymentStartDate) + 1;
        }
        
        
        
        
//            prevLoan = $scope.loans[i-1];
//            currentLoan = $scope.loans[i];
//            lastPayment = prevLoan.schedule[prevLoan.schedule.length - 1].paymentAmount;
//            //find when to roll over the leftover amount
//            nextPaymentIndex = $scope.FindIndexOfObjectWithProperty(currentLoan.schedule, "date", prevLoan.schedule[prevLoan.schedule.length - 1].date);
//            //TODO: round to 2 places
//            //find the total amount leftover from previous loans available to apply to current loans
//            extraAvailableAmount = Math.round(($scope.FindSumOfPreviousPayments(i) + $scope.additionalMonthlyPayment) - lastPayment);
//      
//            if(extraAvailableAmount > 0){
//                //apply the difference in total extra available money sent to the last payment of the previous loan to the payment 
//                //in the current loan of the same month
//                $scope.loans[i] = $scope.ApplyPaymentToLoan(currentLoan.schedule[nextPaymentIndex].paymentAmount + extraAvailableAmount, currentLoan, nextPaymentIndex, nextPaymentIndex + 1); 
//                //then apply the standard cascaded payment to the rest of the payments
//                $scope.loans[i] = $scope.ApplyPaymentToLoan(currentLoan.schedule[nextPaymentIndex + 1].paymentAmount + $scope.FindSumOfPreviousPayments(i), currentLoan, nextPaymentIndex + 1, currentLoan.schedule.length -1);   
//            }else{
//                //apply the total previous loan payment to the next loan at all indices after the previous loans are paid off
//                $scope.loans[i] = $scope.ApplyPaymentToLoan(currentLoan.schedule[nextPaymentIndex].paymentAmount + $scope.FindSumOfPreviousPayments(i), currentLoan, nextPaymentIndex + 1, currentLoan.schedule.length -1); 
//            }  
        
        
        
    }
    
    $scope.FindIndexOfObjectWithProperty = function(array, prop, val){
        for(var i = 0; i < array.length; i++){
            if(array[i][prop] === val ){
                return i;   
            }
        }
        return -1;
    }
    
    //TODO
    $scope.UpdateOverallLoans = function(newLoan, index){
        if(index > $scope.loans.length){
            //ERROR   
        }
        //hasOwnProperty checks object (not prototype chain) for given props
        if(newLoan.hasOwnProperty("schedule")){
            $scope.loans[index].schedule = newLoan.schedule;
        }
        //repeat for other properties?
    }
    
    $scope.ResetLoans = function(){
        $scope.noneSelected = true;
        $scope.snowballSelected = false;
        $scope.avalancheSelected = false;
        $scope.loans = [];
        $scope.unsortedLoans = [];
        $scope.totalMonthlyPayment = 0;
        $scope.additionalMonthlyPayment = 0;
        //$scope.isSorted = false;
        $scope.allDebtsHidden = true;
        $scope.hiddenSchedule = true; 
        $scope.Init();
    }

    $scope.ApplyPayment = function(currentPayment, amount, interestRate, prevInterest, prevPayment, principle){
        var monthlyInterestRate = (interestRate/100) / 12;
        //var interestRate = rate;
        //var term = loan.term;
        //var totalMonthlyPayment = loan.minimumMonthlyPayment;
        
        currentPayment.paymentAmount = amount;//loan.minimumMonthlyPayment + additional;
        //$scope.totalPaid = $scope.totalPaid + currentPayment.paymentAmount;
        currentPayment.currentPaidOverall = prevPayment + currentPayment.paymentAmount;
        currentPayment.towardInterest = principle * monthlyInterestRate;
        //$scope.totalInterestPaid = $scope.totalInterestPaid + currentPayment.towardInterest;
        currentPayment.currentInterestPaid = prevInterest + currentPayment.towardInterest;
        currentPayment.towardPrinciple = currentPayment.paymentAmount - currentPayment.towardInterest;
        currentPayment.principleRemaining = principle - currentPayment.towardPrinciple;
        
        return currentPayment;
    }
    
    //subtract (add) the amount less than zero from the payment amount and recalculate
    $scope.ReconcilePaymentAfterPayoff = function(payment){
        payment.paymentAmount = payment.paymentAmount + payment.principleRemaining;
        payment.currentPaidOverall += payment.principleRemaining;
        payment.towardPrinciple = payment.paymentAmount - payment.towardInterest;
        payment.principleRemaining = 0;  
        return payment;
    }
    
    
    //on form, make total's minimum value be equal to minimumPayment field, but field is not required
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
                currentPayment = $scope.ApplyPayment(currentPayment, loan.minimumMonthlyPayment, loan.interestRate, previousInterestTotal, previousPaymentTotal, principle);
                currentPayment.date = formatDate(currentDate);
                if(currentPayment.principleRemaining < 0){
                    currentPayment = $scope.ReconcilePaymentAfterPayoff(currentPayment) 
                }
                principle = currentPayment.principleRemaining;
                previousPaymentTotal += currentPayment.paymentAmount;
                previousInterestTotal += currentPayment.towardInterest;
                currentDate.setMonth(currentDate.getMonth() + 1);//new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
                schedule.push(currentPayment);
            }
        return schedule;
    };
    $scope.Init();
}]);