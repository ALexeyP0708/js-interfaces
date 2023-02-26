
import {InterfaceError} from "../InterfaceError.js";


InterfaceError.consoleNotification = true

//InterfaceData.addGlobalEndPoints(InterfaceError)


/**
 * @alias ErrorTypes
 * @namespace
 */



/**
 * @var consoleGroup
 *  Template for the header of grouped error messages
 */
InterfaceError.types('consoleGroup','{$type}:{$message}')

/**
 * @var  consoleMessage
 * Console message template */
InterfaceError.types('consoleMessage', '{$message}')

/** Template for errors when no error is defined */
InterfaceError.types('default','{$type}: {$entryPoints} - {$message}{$errors}')

/**
 * @var  BadCriteria
 * An error is thrown in the following cases:
 * -  when forming an interface member, if the object for the criteria does not match the criteria template
 * ([template  .PropertyCriteria], [template .CriteriaMethodType], [template .CriteriaReactType])
 * - Criteria are not comparable when comparing interfaces
 */
InterfaceError.types('BadCriteria', '{$type}: {$entryPoints} - Criteria must meet [object {$className}].')

/**
 * @var Init_BadIncludesOrExcludes
 * An error is thrown in the following cases:
 * - when forming an interface member, if the criteria "includes" or "excludes" are incorrect
 *
 * Accompanied by errors: {@link ...InitIncludes},  {@link ...InitExcludes}
 */
//InterfaceError.types('Init_BadIncludesOrExcludes', '') // "{$type}: {$entryPoints} - {$errors}"

/**
 * @var BadTypes
 * An error is thrown in the following cases:
 * - when forming an interface member, if the passed types for the criteria are not correct.
 *
 * Groups errors of all invalid types
 *
 * Accompanied by errors: {@link ...InitTypes_badType}
 *
 */
//InterfaceError.types('BadTypes', '')

/**
 * @var BadType_Incorrect
 * An error is thrown in the following cases:
 * -when forming an interface member, if an inappropriate type is passed.
 */

InterfaceError.types('BadType_Incorrect', '{$type}: {$entryPoints} - Invalid parameter passed [{$dataType}].')
InterfaceError.types('BadType_Duplicate', '{$type}: {$entryPoints} - duplicate type [{$dataType}].')

/**
 * @var InitIncludes
 * An error is thrown in the following cases:
 *  - when forming an interface member,  if the passed "includes" values for the criteria are not correct.
 *
 *  Groups errors of all invalid "includes" values.
 *
 *  Accompanied by errors: {@link ...ValidateType}
 */

//InterfaceError.types('InitIncludes', '')
/**
 * @var InitExcludes
 * An error is thrown in the following cases:
 *  - when forming an interface member,  if the passed "excludes" values ​​for the criteria are not correct.
 *
 * Groups errors of all invalid "excludes" values.
 *
 * Accompanied by errors:  {@link ...ValidateType}
 */
//InterfaceError.types('InitExcludes', '')
/**
 * @var Init_BadArgumentsOrReturn
 * An error is thrown in the following cases:
 *  - when forming an interface member (method), if the criteria for arguments and/or return values ​​are not correct
 *
 *  Groups errors.
 *
 * Accompanied by errors: {@link ...BadCriteria} {@link ...InitTypes} {@link ...Init_BadIncludesOrExcludes}
 */
//InterfaceError.types('Init_BadArgumentsOrReturn', '')
/**
 *
 * @var Validate
 * An error is thrown in the following cases:
 * - When checking class members for an interface (matching criteria),
 * if the member value (property, method arguments, method return values,
 * reactive properties) does not meet the criteria
 * Groups errors the criteria
 *
 * Accompanied by errors: {@link ...ValidateInIncludes}, {@link ...validateInExcludes}
 */
//InterfaceError.types('Validate', '')

/**
 * @var ValidateType
 * An error is thrown in the following cases:
 * -  When validate class members according to interface criteria , If the value does not match the types from the interface criteria
 *
 * Accompanied by errors:  {@link ...Validate_BadMirrorProperties} (if one of the types is extends [class  .MirrorInterface])
 */
InterfaceError.types('ValidateType', '{$type}: {$entryPoints} - Expected type of "{$expectedTypes}"  but defined by "{$definedType}".{$errors}')

/**
 * @var ValidateInIncludes
 * An error is thrown in the following cases:
 * -When validate class members according to interface criteria , if the value does not match the value on the "includes" stack
 */
InterfaceError.types('ValidateInIncludes', "{$type}: {$entryPoints} - \"{$value}\" is not present in 'includes' stack")

/**
 * @var ValidateInExcludes
 * An error is thrown in the following cases:
 *  -When validate class members according to interface criteria , if the value matches one of the values ​​on the "excludes" stack
 */
InterfaceError.types('ValidateInExcludes', "{$type}: {$entryPoints} - \"{$value}\" is present in 'excludes' stack")

/**
 * @var ValidateMethodDeclared
 * An error is thrown in the following cases:
 * -When validated  class members from criteria, if class member is not a method.
 */
InterfaceError.types('ValidateMethodDeclared', '{$type}: {$entryPoints} - The property must be Function.')

/**
 * @var ValidateArguments
 * An error is thrown in the following cases:
 *  -When validation the arguments of the class methods according to the interface criteria, if the argument does not meet the criteria.
 *
 *  Groups errors for arguments
 *
 *  Accompanied by errors:  {@link ...Validate}, {@link ...ValidateType}
 */
//InterfaceError.types('ValidateArguments', '')

/**
 * @var ValidateReactDeclared
 *  An error is thrown in the following cases:
 *  -when validated the reactive property values ​​,if getter / setter should be declared or not declared,
 *  - when a reactive property is to be declared.
 */
InterfaceError.types('ValidateReactDeclared', '{$type}: {$entryPoints} - "{$react_type}" {$not} must be declared')

/**
 * @var ValidateMemberDeclared
 * An error is thrown in the following cases:
 * -When validated  class members from criteria, if there is no member in the class.
 */
InterfaceError.types('ValidateMemberDeclared', '{$type}: {$entryPoints} - The member must be declared.')

/**
 * @var Validate_BadMembers
 * An error is thrown in the following cases:
 * -when the class fails validation.
 *
 * Groups errors
 *
 * Accompanied by errors:
 * {@link ...ValidateMemberDeclared},
 * {@link ...ValidateReactDeclared},
 * {@link ...ValidateMethodDeclared},
 * {@link ...Validate}
 * {@link ...ValidateType}
 */
//InterfaceError.types('Validate_BadMembers', '')

/**
 * @var Validate_BadMirrorProperties
 * An error is thrown in the following cases:
 * -When a class or object is validated against  mirror interface.
 *
 * Accompanied by errors: {@link ...Validate_BadMembers}
 */
//InterfaceError.types('Validate_BadMirrorProperties', '')

/**
 * @var Compare
 * An error is thrown in the following cases:
 * -When comparing criteria for interface members,if the interfaces do not match the criteria
 *
 * Groups errors the criteria when compare
 *
 * Accompanied by errors:  {@link ...CompareIncludes}, {@link ...CompareExcludes}
 */
//InterfaceError.types('Compare', '')

/**
 * @var CompareTypes
 * An error is thrown in the following cases:
 * - When comparing criteria for interface members, if the criteria "types" do not match
 */
InterfaceError.types('CompareTypes', '{$type}: {$entryPoints} - not matching stacks "types"')// "{$type}: {$entryPoints} - type \"{$value}\" is not present in 'types' stack",

/**
 * @var CompareIncludes
 * An error is thrown in the following cases:
 * - When comparing criteria for interface members, if the criteria "includes" do not match
 */
InterfaceError.types('CompareIncludes', '{$type}: {$entryPoints} - not matching stacks "includes"')

/**
 * @var CompareExcludes
 * An error is thrown in the following cases:
 * - When comparing criteria for interface members, if the criteria "excludes" do not match
 */
InterfaceError.types('CompareExcludes', '{$type}: {$entryPoints} - not matching stacks "excludes"')

/**
 * @var CompareMethod
 *  An error is thrown in the following cases:
 *  -When comparing criteria for interface members, if in the method the arguments or return do not match the rules of the matched interface
 *
 */
//InterfaceError.types('CompareMethod', '')

/**
 * @var CompareReact
 *  An error is thrown in the following cases:
 *  - if getter or setter is not declared or criteria are not matched.
 */
//InterfaceError.types('CompareReact', '')


/**
 * @var ImplementInterfaceError
 * An error is thrown in the following cases:
 * - When  [method .InterfaceBuilder.implementInterfaces] is called and the first argument is an interface.
 * Build and validation happens only for classes.
 */
//InterfaceError.types('ImplementInterfaceError', '')
