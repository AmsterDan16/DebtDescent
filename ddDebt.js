app.directive('ddDebt', function(){
   return {
       restrict:'E',
//       scope:{
//         loan: '@'
//         //,loans: '=debts'
//       },
       //replace:true,
       templateUrl:"ddDebt.html",
      link: function(scope, element, attrs){
            scope.showSchedule = function(){
                scope.hiddenSchedule = !scope.hiddenSchedule;  
            };
            scope.RetrieveTotalPaid = function(loan){
                //extract paymentAmounts into array
                var payments = []
                for(var i = 0; i < loan.schedule.length; i++){
                    payments.push(loan.schedule[i].paymentAmount);   
                }
                return payments.reduce(function(a,b){return a + b});
                //return loan.schedule.reduce(function(a,b){return a.paymentAmount + b.paymentAmount});   
            }

            scope.RetrievePayoffDate = function(loan){
                return loan.schedule[loan.schedule.length - 1].date;   
            }
      }

   };
});

//app.directive('ddDebt', function(){
//   return {
//       restrict:'E',
//       scope: {
//         loan: '=debt',
//         loans: '=debts'
//       },
//       templateUrl:"<tr><td>hrey</td></tr>"//,//'ddDebt.html',
//       link: function(scope, element, attrs){
//            scope.RetrieveTotalPaid = function(loan){
//                //extract paymentAmounts into array
//                var payments = []
//                for(var i = 0; i < loan.schedule.length; i++){
//                    payments.push(loan.schedule[i].paymentAmount);   
//                }
//                return payments.reduce(function(a,b){return a + b});
//                //return loan.schedule.reduce(function(a,b){return a.paymentAmount + b.paymentAmount});   
//            }
//
//            scope.RetrievePayoffDate = function(loan){
//                return loan.schedule[loan.schedule.length - 1].date;   
//            }
//       }
//
//   };
//});
